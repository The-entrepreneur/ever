"""
routers/orders.py — POST /api/v1/orders and GET /api/v1/orders/menu

Handles in-chat F&B, spa, and transport order creation.

Flow:
  1. Bot Engine POSTs OrderCreateRequest after guest confirms in chat.
  2. This router writes the order to Supabase `orders` table.
  3. It then calls `pos_adapter.post_folio_charge()` to post to the
     hotel PMS folio. If PMS is unreachable, the fallback marks the
     order for manual processing and logs to `folio_charges` as
     `status='manual_required'`.
  4. The response is returned to the bot engine, which sends the
     order confirmation back to the guest.

Security: All endpoints require X-API-Key (internal Docker network only).
"""
import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from auth import verify_api_key
from database import get_db
from models.order import (
    OrderCreateRequest, OrderResponse,
    MenuResponse, MenuItem,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/orders",
    tags=["orders"],
    dependencies=[Depends(verify_api_key)],
)

HOTEL_CURRENCY = os.getenv("HOTEL_CURRENCY", "GBP")
DEFAULT_ETA     = int(os.getenv("ORDER_ETA_MINUTES", "20"))


# ─── Menu catalogue endpoint ───────────────────────────────────────────────────

@router.get("/menu", response_model=MenuResponse)
async def get_menu(
    hotel_slug: str = Query(...),
    category:   str = Query("f&b"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns available menu items for a hotel filtered by category.
    Categories: f&b | spa | transport | other
    """
    try:
        result = await db.execute(
            text("""
                SELECT
                    id::text, name, description, price, category,
                    available, prep_time_mins
                FROM menu_items
                WHERE hotel_slug = :hotel_slug
                  AND category   = :category
                  AND available  = TRUE
                ORDER BY name
            """),
            {"hotel_slug": hotel_slug, "category": category},
        )
        rows = result.fetchall()
        items = [
            MenuItem(
                id=r[0], name=r[1], description=r[2],
                price=float(r[3]), category=r[4],
                available=r[5], prep_time_mins=r[6],
            )
            for r in rows
        ]
        return MenuResponse(items=items, category=category, hotel_slug=hotel_slug)
    except Exception as exc:
        logger.error("[Orders] get_menu error: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to fetch menu")


# ─── Create order endpoint ─────────────────────────────────────────────────────

@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    req: OrderCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a new in-chat order, posts folio charge to PMS, and returns
    a confirmation payload for the bot engine to relay to the guest.
    """
    order_id  = str(uuid.uuid4())
    order_ref = f"ORD-{int(datetime.now(timezone.utc).timestamp())}"
    now       = datetime.now(timezone.utc).isoformat()

    # Serialise items to JSONB-compatible list of dicts
    items_json = [item.model_dump() for item in req.items]

    try:
        # 1. Write order to Supabase `orders` table
        await db.execute(
            text("""
                INSERT INTO orders (
                    id, hotel_slug, session_id, room_number,
                    items, total_amount, status, folio_posted,
                    channel, notes, created_at, updated_at
                ) VALUES (
                    :id, :hotel_slug, :session_id, :room_number,
                    :items::jsonb, :total_amount, 'pending', FALSE,
                    :channel, :notes, :now, :now
                )
            """),
            {
                "id":           order_id,
                "hotel_slug":   req.hotel_slug,
                "session_id":   req.session_id,
                "room_number":  req.room_number,
                "items":        str(items_json).replace("'", '"'),
                "total_amount": req.total_amount,
                "channel":      req.channel,
                "notes":        req.notes or "",
                "now":          now,
            },
        )
        await db.commit()
        logger.info("[Orders] Created order %s for hotel %s", order_ref, req.hotel_slug)

    except Exception as exc:
        await db.rollback()
        logger.error("[Orders] DB write error: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to create order")

    # 2. Attempt to post folio charge to hotel PMS via pos_adapter
    folio_posted = False
    try:
        from services.pos_adapter import POSAdapter
        adapter = POSAdapter()
        await adapter.post_folio_charge(
            booking_lookup={"room_number": req.room_number, "hotel_slug": req.hotel_slug},
            order_id=order_id,
            description=f"In-room order: {', '.join(i.name for i in req.items)}",
            amount=req.total_amount,
        )
        # Mark order as folio posted
        await db.execute(
            text("UPDATE orders SET folio_posted=TRUE, updated_at=:now WHERE id=:id"),
            {"id": order_id, "now": now},
        )
        await db.commit()
        folio_posted = True
        logger.info("[Orders] Folio charge posted for order %s", order_ref)

    except Exception as exc:
        # Fallback: order is saved but staff must manually post folio
        logger.warning("[Orders] Folio post failed (fallback to manual): %s", exc)
        await db.execute(
            text("UPDATE orders SET status='manual_required', updated_at=:now WHERE id=:id"),
            {"id": order_id, "now": now},
        )
        try:
            await db.commit()
        except Exception:
            pass

    return OrderResponse(
        order_id=order_id,
        order_ref=order_ref,
        room_number=req.room_number,
        total_amount=req.total_amount,
        status="pending",
        eta_minutes=DEFAULT_ETA,
        folio_posted=folio_posted,
    )


# ─── Get order status endpoint ─────────────────────────────────────────────────

@router.get("/{order_id}")
async def get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    """Returns current status of an order by its UUID."""
    result = await db.execute(
        text("SELECT id, status, total_amount, folio_posted, created_at FROM orders WHERE id=:id"),
        {"id": order_id},
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "order_id":    str(row[0]),
        "status":      row[1],
        "total_amount": float(row[2]),
        "folio_posted": row[3],
        "created_at":  str(row[4]),
    }
