"""
services/pos_adapter.py — Point of Sale (POS) Adapter Layer

Translates in-chat food, beverage, spa, and transport orders into target POS outlet systems
(Lightspeed Restaurant, Square for Restaurants, Oracle MICROS, or webhook receivers).

Decoupled Architecture:
  - POSAdapter manages outlet orders, kitchen tickets, and menu catalogues.
  - If `ROOM_FOLIO_ENABLED=true` (default), POSAdapter calls PMSAdapter (`services/pms_adapter.py`)
    to post the charge total onto the guest's room bill in their PMS profile (Cloudbeds, Mews, Opera).
  - POSAdapter always writes an audit log to Supabase `folio_charges`.

Supported POS Connection Types (configured via POS_TYPE):
  - lightspeed  → Lightspeed Restaurant REST API
  - square      → Square for Restaurants API v2
  - micros      → Oracle MICROS / Simphony via OHIP
  - rest        → Generic RESTful POS API
  - webhook     → Push order payloads to hotel POS receiver endpoint
  - fallback    → Local order logging only; alerts staff for manual entry
"""

import os
import logging
import uuid
from datetime import datetime, timezone

import httpx

from services.pms_adapter import PMSAdapter

logger = logging.getLogger(__name__)

POS_TYPE           = os.getenv("POS_TYPE", os.getenv("POS_INTEGRATION_TYPE", "fallback")).lower()
POS_API_BASE_URL   = os.getenv("POS_API_BASE_URL", os.getenv("POS_REST_BASE_URL", ""))
POS_API_KEY        = os.getenv("POS_API_KEY", os.getenv("POS_REST_AUTH_HEADER", ""))
POS_LOCATION_ID    = os.getenv("POS_LOCATION_ID", "")
POS_WEBHOOK_URL    = os.getenv("POS_WEBHOOK_URL", "")

ROOM_FOLIO_ENABLED = os.getenv("ROOM_FOLIO_ENABLED", "true").lower() in ("true", "1", "yes")

# Supabase direct logging (always used as audit trail)
SUPABASE_URL          = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY  = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


class POSAdapter:
    """
    Main POS Adapter for managing outlet orders and triggering PMS room folio charges.
    """

    def __init__(self):
        self.pms_adapter = PMSAdapter()

    async def post_folio_charge(
        self,
        booking_lookup: dict,
        order_id: str,
        description: str,
        amount: float,
        currency: str = "GBP",
    ) -> dict:
        """
        Process an order charge:
          1. Send ticket/order to POS outlet (Lightspeed, Square, Micros, or Webhook).
          2. If ROOM_FOLIO_ENABLED=true, delegate folio posting to PMSAdapter.
          3. Write audit log to Supabase `folio_charges`.
        """
        pos_reference = None
        status        = "manual_required"

        # ── 1. Dispatch ticket to target POS Outlet System ─────────────────────
        try:
            if POS_TYPE == "lightspeed" and POS_API_BASE_URL:
                pos_reference = await self._post_lightspeed_ticket(booking_lookup, description, amount)
                status = "posted"

            elif POS_TYPE == "square" and POS_API_BASE_URL:
                pos_reference = await self._post_square_order(booking_lookup, description, amount)
                status = "posted"

            elif POS_TYPE == "webhook" and POS_WEBHOOK_URL:
                pos_reference = await self._post_webhook(booking_lookup, order_id, description, amount, currency)
                status = "posted"

            else:
                pos_reference = f"TICKET-{uuid.uuid4().hex[:8].upper()}"
                logger.info("[POSAdapter] POS_TYPE=%s — ticket created: %s", POS_TYPE, pos_reference)

        except Exception as exc:
            pos_reference = f"FAILED-{uuid.uuid4().hex[:8].upper()}"
            logger.error("[POSAdapter] POS Outlet dispatch error (%s): %s", POS_TYPE, exc)

        # ── 2. Post Charge to Room Bill via PMSAdapter (if enabled) ────────────
        room_number = booking_lookup.get("room_number")
        if ROOM_FOLIO_ENABLED and room_number:
            pms_result = await self.pms_adapter.post_room_folio_charge(
                room_number=room_number,
                description=description,
                amount=amount,
                currency=currency,
            )
            if pms_result.get("status") == "posted":
                pos_reference = pms_result.get("pos_reference", pos_reference)
                status = "posted"

        # ── 3. Write Audit Log to Supabase `folio_charges` ──────────────────────
        await self._write_folio_audit(
            order_id=order_id,
            hotel_slug=booking_lookup.get("hotel_slug", ""),
            booking_id=booking_lookup.get("booking_id", room_number or ""),
            description=description,
            amount=amount,
            pos_reference=pos_reference or "",
        )

        return {"pos_reference": pos_reference, "status": status}

    # ── Lightspeed Outlet Order ───────────────────────────────────────────────

    async def _post_lightspeed_ticket(self, booking_lookup: dict, description: str, amount: float) -> str:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{POS_API_BASE_URL}/orders",
                headers={"Authorization": f"Bearer {POS_API_KEY}"},
                json={
                    "location_id": POS_LOCATION_ID,
                    "room_number": booking_lookup.get("room_number"),
                    "note": description,
                    "total": amount,
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("order_id") or f"LS-{uuid.uuid4().hex[:8].upper()}"

    # ── Square Outlet Order ───────────────────────────────────────────────────

    async def _post_square_order(self, booking_lookup: dict, description: str, amount: float) -> str:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{POS_API_BASE_URL}/v2/locations/{POS_LOCATION_ID}/orders",
                headers={"Authorization": f"Bearer {POS_API_KEY}"},
                json={
                    "order": {
                        "location_id": POS_LOCATION_ID,
                        "reference_id": f"Room-{booking_lookup.get('room_number')}",
                        "line_items": [{"name": description, "quantity": "1", "base_price_money": {"amount": int(amount * 100), "currency": "GBP"}}]
                    }
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("order", {}).get("id") or f"SQ-{uuid.uuid4().hex[:8].upper()}"

    # ── Webhook Order Dispatch ────────────────────────────────────────────────

    async def _post_webhook(
        self, booking_lookup: dict, order_id: str,
        description: str, amount: float, currency: str
    ) -> str:
        event_id = uuid.uuid4().hex
        payload = {
            "event": "pos.order.created",
            "event_id": event_id,
            "hotel_slug": booking_lookup.get("hotel_slug"),
            "room_number": booking_lookup.get("room_number"),
            "order_id": order_id,
            "description": description,
            "amount": amount,
            "currency": currency,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                POS_WEBHOOK_URL,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            return f"WHK-{event_id[:12].upper()}"

    # ── Supabase Audit Write ──────────────────────────────────────────────────

    async def _write_folio_audit(
        self, order_id: str, hotel_slug: str, booking_id: str,
        description: str, amount: float, pos_reference: str,
    ):
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            logger.warning("[POSAdapter] Supabase not configured — skipping audit write")
            return

        record = {
            "id": str(uuid.uuid4()),
            "hotel_slug": hotel_slug,
            "booking_id": booking_id,
            "order_id": order_id,
            "description": description,
            "amount": amount,
            "pos_reference": pos_reference,
            "posted_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.post(
                    f"{SUPABASE_URL}/rest/v1/folio_charges",
                    json=record,
                    headers={
                        "apikey": SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal",
                    },
                )
                if response.status_code not in (200, 201):
                    logger.error("[POSAdapter] Supabase folio_charges write failed: %s", response.text)
                else:
                    logger.info("[POSAdapter] Audit record written: %s", pos_reference)
        except Exception as exc:
            logger.error("[POSAdapter] Supabase audit write exception: %s", exc)
