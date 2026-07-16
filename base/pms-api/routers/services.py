"""
routers/services.py — POST /api/v1/services

Handles operational (non-revenue) service requests:
    laundry | housekeeping | wakeup | restaurant | other

Flow:
  1. Bot Engine POSTs ServiceCreateRequest after guest confirms in chat.
  2. This router writes the request to Supabase `service_requests` table.
  3. Staff are notified via the configured notification channel
     (Slack webhook or WhatsApp staff group via OpenBSP).
  4. No folio charge is posted — revenue is collected at delivery/service time.
  5. Response is returned to the bot engine for guest confirmation.

Security: All endpoints require X-API-Key (internal Docker network only).
"""
import os
import uuid
import logging
import json
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from auth import verify_api_key
from database import get_db
from models.order import ServiceCreateRequest, ServiceResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/services",
    tags=["services"],
    dependencies=[Depends(verify_api_key)],
)

SLACK_WEBHOOK_URL  = os.getenv("SLACK_WEBHOOK_URL", "")
STAFF_WA_NUMBER    = os.getenv("STAFF_WHATSAPP_NUMBER", "")
OPENBSP_BASE_URL   = os.getenv("OPENBSP_BASE_URL", "")
OPENBSP_PUB_KEY    = os.getenv("OPENBSP_PUBLISHABLE_KEY", "")
OPENBSP_OWNER_KEY  = os.getenv("OPENBSP_OWNER_API_KEY", "")

SERVICE_EMOJI = {
    "laundry":      "👔",
    "housekeeping": "🧹",
    "wakeup":       "⏰",
    "restaurant":   "🍽️",
    "other":        "🏨",
}


async def _notify_staff(service_type: str, room_number: str, details: dict, request_ref: str):
    """
    Notify hotel staff of a new service request via Slack or WhatsApp.
    Failures are logged and swallowed — guest experience must not be disrupted.
    """
    emoji   = SERVICE_EMOJI.get(service_type, "🏨")
    detail_text = details.get("description", str(details))
    message = (
        f"{emoji} *New Service Request*\n"
        f"Ref: `{request_ref}`\n"
        f"Room: *{room_number}*\n"
        f"Type: *{service_type.capitalize()}*\n"
        f"Details: {detail_text}"
    )

    # ── Slack notification ─────────────────────────────────────────────────
    if SLACK_WEBHOOK_URL:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                await client.post(SLACK_WEBHOOK_URL, json={"text": message})
                logger.info("[Services] Staff notified via Slack for %s", request_ref)
        except Exception as exc:
            logger.warning("[Services] Slack notify failed: %s", exc)

    # ── WhatsApp staff group via OpenBSP ───────────────────────────────────
    elif OPENBSP_BASE_URL and STAFF_WA_NUMBER:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                await client.post(
                    f"{OPENBSP_BASE_URL}/rest/v1/messages",
                    headers={
                        "apikey":   OPENBSP_PUB_KEY,
                        "api-key":  OPENBSP_OWNER_KEY,
                        "Content-Type": "application/json",
                    },
                    json={
                        "messaging_product": "whatsapp",
                        "recipient_type":    "individual",
                        "to":                STAFF_WA_NUMBER,
                        "type":              "text",
                        "text":              {"body": message.replace("*", "").replace("`", "")},
                    },
                )
                logger.info("[Services] Staff notified via WhatsApp for %s", request_ref)
        except Exception as exc:
            logger.warning("[Services] WhatsApp notify failed: %s", exc)
    else:
        logger.warning("[Services] No staff notification channel configured for %s", request_ref)


# ─── Create service request endpoint ──────────────────────────────────────────

@router.post("", response_model=ServiceResponse, status_code=201)
async def create_service_request(
    req: ServiceCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a new operational service request and notifies hotel staff.
    """
    request_id  = str(uuid.uuid4())
    request_ref = f"SVC-{int(datetime.now(timezone.utc).timestamp())}"
    now         = datetime.now(timezone.utc).isoformat()

    # Parse scheduled_for if provided
    scheduled_for = None
    if req.scheduled_for:
        try:
            scheduled_for = datetime.fromisoformat(req.scheduled_for).isoformat()
        except ValueError:
            logger.warning("[Services] Invalid scheduled_for format: %s", req.scheduled_for)

    try:
        await db.execute(
            text("""
                INSERT INTO service_requests (
                    id, hotel_slug, session_id, room_number,
                    service_type, details, scheduled_for, status,
                    channel, created_at, updated_at
                ) VALUES (
                    :id, :hotel_slug, :session_id, :room_number,
                    :service_type, :details::jsonb, :scheduled_for, 'pending',
                    :channel, :now, :now
                )
            """),
            {
                "id":            request_id,
                "hotel_slug":    req.hotel_slug,
                "session_id":    req.session_id,
                "room_number":   req.room_number,
                "service_type":  req.service_type,
                "details":       json.dumps(req.details),
                "scheduled_for": scheduled_for,
                "channel":       req.channel,
                "now":           now,
            },
        )
        await db.commit()
        logger.info("[Services] Created service request %s", request_ref)

    except Exception as exc:
        await db.rollback()
        logger.error("[Services] DB write error: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to create service request")

    # Notify staff asynchronously (fire-and-forget style; errors are logged not raised)
    await _notify_staff(req.service_type, req.room_number, req.details, request_ref)

    return ServiceResponse(
        id=request_id,
        request_ref=request_ref,
        service_type=req.service_type,
        room_number=req.room_number,
        status="pending",
        created_at=now,
    )


# ─── Update service request status ────────────────────────────────────────────

@router.patch("/{request_id}/status")
async def update_service_status(
    request_id: str,
    status:     str,
    db: AsyncSession = Depends(get_db),
):
    """
    Called by the hotel dashboard when staff action a service request.
    status options: acknowledged | in_progress | completed | cancelled
    """
    valid = {"acknowledged", "in_progress", "completed", "cancelled"}
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"status must be one of: {valid}")

    now = datetime.now(timezone.utc).isoformat()
    result = await db.execute(
        text("""
            UPDATE service_requests
            SET status=:status, updated_at=:now
            WHERE id=:id
            RETURNING id, status
        """),
        {"id": request_id, "status": status, "now": now},
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Service request not found")

    await db.commit()
    return {"id": str(row[0]), "status": row[1]}
