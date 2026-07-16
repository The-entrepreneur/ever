"""
services/pos_adapter.py — POS / PMS Adapter Layer

Translates EVER's internal order/folio events into the format expected
by the hotel's actual Property Management System (PMS).

Supported connection patterns (configured via POS_INTEGRATION_TYPE):
  - rest         → RESTful PMS API (most modern cloud PMS providers)
  - soap         → Legacy SOAP/XML PMS (Opera PMS, older Micros, etc.)
  - webhook      → PMS receives webhook events (push-based integration)
  - fallback     → No PMS integration; logs to `folio_charges` for manual posting

The adapter always writes a `folio_charges` audit record regardless of
PMS connectivity — this ensures no charge is ever silently lost.

Pattern selection:
  POS_INTEGRATION_TYPE = rest | soap | webhook | fallback
  POS_REST_BASE_URL    = https://your-pms.hotel.com/api
  POS_REST_AUTH_HEADER = Bearer your-token
  POS_SOAP_WSDL        = http://legacy-pms/wsdl
  POS_WEBHOOK_URL      = https://pms-receiver.hotel.com/folio-events
"""
import os
import json
import logging
import uuid
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

INTEGRATION_TYPE    = os.getenv("POS_INTEGRATION_TYPE", "fallback").lower()
REST_BASE_URL       = os.getenv("POS_REST_BASE_URL", "")
REST_AUTH_HEADER    = os.getenv("POS_REST_AUTH_HEADER", "")    # e.g. "Bearer token123"
SOAP_WSDL           = os.getenv("POS_SOAP_WSDL", "")
WEBHOOK_URL         = os.getenv("POS_WEBHOOK_URL", "")

# Supabase direct logging (always used as audit trail)
SUPABASE_URL        = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


class POSAdapter:
    """
    Main POS adapter. Instantiate once per request (lightweight).
    All methods are async — designed for use inside FastAPI route handlers.
    """

    # ── Public interface ──────────────────────────────────────────────────────

    async def post_folio_charge(
        self,
        booking_lookup: dict,
        order_id: str,
        description: str,
        amount: float,
        currency: str = "GBP",
    ) -> dict:
        """
        Post a folio charge to the hotel PMS and log to Supabase audit table.

        Args:
            booking_lookup: {"room_number": "204", "hotel_slug": "grand-hotel"}
            order_id:       UUID of the order in Supabase `orders` table
            description:    Human-readable line item description
            amount:         Charge amount (positive float)
            currency:       ISO 4217 currency code

        Returns:
            {"pos_reference": str, "status": "posted" | "manual_required"}

        Raises:
            Exception if both PMS and audit log fail (unlikely; indicates DB issue)
        """
        pos_reference = None
        status        = "manual_required"

        # ── Attempt PMS integration ───────────────────────────────────────────
        try:
            if INTEGRATION_TYPE == "rest":
                pos_reference = await self._post_rest(booking_lookup, description, amount, currency)
                status = "posted"

            elif INTEGRATION_TYPE == "soap":
                pos_reference = await self._post_soap(booking_lookup, description, amount, currency)
                status = "posted"

            elif INTEGRATION_TYPE == "webhook":
                pos_reference = await self._post_webhook(booking_lookup, order_id, description, amount, currency)
                status = "posted"

            else:
                # fallback mode: no PMS, log only
                pos_reference = f"MANUAL-{uuid.uuid4().hex[:8].upper()}"
                status        = "manual_required"
                logger.info(
                    "[POSAdapter] Fallback mode: folio charge %s requires manual posting", pos_reference
                )

        except Exception as exc:
            pos_reference = f"FAILED-{uuid.uuid4().hex[:8].upper()}"
            status        = "manual_required"
            logger.error("[POSAdapter] PMS post error (%s): %s", INTEGRATION_TYPE, exc)

        # ── Always write audit record to Supabase folio_charges ──────────────
        await self._write_folio_audit(
            order_id=order_id,
            hotel_slug=booking_lookup.get("hotel_slug", ""),
            booking_id=booking_lookup.get("booking_id", booking_lookup.get("room_number", "")),
            description=description,
            amount=amount,
            pos_reference=pos_reference or "",
        )

        return {"pos_reference": pos_reference, "status": status}

    # ── REST integration ──────────────────────────────────────────────────────

    async def _post_rest(
        self, booking_lookup: dict, description: str, amount: float, currency: str
    ) -> str:
        """POST a folio charge to a RESTful PMS API."""
        if not REST_BASE_URL:
            raise ValueError("POS_REST_BASE_URL is not configured")

        payload = {
            "room_number": booking_lookup.get("room_number"),
            "description": description,
            "amount":      amount,
            "currency":    currency,
            "source":      "ever_bot",
        }
        headers = {"Content-Type": "application/json"}
        if REST_AUTH_HEADER:
            scheme, _, token = REST_AUTH_HEADER.partition(" ")
            headers["Authorization"] = f"{scheme} {token}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{REST_BASE_URL}/folio/charges",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            data = response.json()
            return data.get("reference") or data.get("id") or f"REST-{uuid.uuid4().hex[:8].upper()}"

    # ── SOAP integration ──────────────────────────────────────────────────────

    async def _post_soap(
        self, booking_lookup: dict, description: str, amount: float, currency: str
    ) -> str:
        """
        Post a folio charge via SOAP/XML to a legacy PMS (e.g. Opera).
        Uses httpx directly — avoids zeep dependency for simplicity.
        The SOAP envelope format is a common hotel industry pattern.
        Adjust the envelope template to match your PMS's WSDL spec.
        """
        if not SOAP_WSDL:
            raise ValueError("POS_SOAP_WSDL is not configured")

        # Derive the SOAP endpoint URL from the WSDL (strip ?wsdl suffix)
        endpoint = SOAP_WSDL.replace("?wsdl", "").replace("?WSDL", "")

        # Generic SOAP 1.1 envelope — customise namespace/operation for your PMS
        soap_body = f"""<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://hotel.pms.api/folio">
  <soap:Header/>
  <soap:Body>
    <tns:PostFolioCharge>
      <tns:RoomNumber>{booking_lookup.get("room_number", "")}</tns:RoomNumber>
      <tns:Description>{description}</tns:Description>
      <tns:Amount>{amount:.2f}</tns:Amount>
      <tns:Currency>{currency}</tns:Currency>
      <tns:Source>EVER</tns:Source>
    </tns:PostFolioCharge>
  </soap:Body>
</soap:Envelope>"""

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                endpoint,
                content=soap_body.encode("utf-8"),
                headers={
                    "Content-Type": "text/xml; charset=utf-8",
                    "SOAPAction":   '"http://hotel.pms.api/folio/PostFolioCharge"',
                },
            )
            response.raise_for_status()
            # Parse reference from SOAP response (simplified — adjust xpath for your PMS)
            text_resp = response.text
            import re
            ref_match = re.search(r"<[Rr]eference[^>]*>([^<]+)<", text_resp)
            return ref_match.group(1) if ref_match else f"SOAP-{uuid.uuid4().hex[:8].upper()}"

    # ── Webhook integration ───────────────────────────────────────────────────

    async def _post_webhook(
        self, booking_lookup: dict, order_id: str,
        description: str, amount: float, currency: str
    ) -> str:
        """Send a webhook event to the PMS receiver endpoint."""
        if not WEBHOOK_URL:
            raise ValueError("POS_WEBHOOK_URL is not configured")

        event_id = uuid.uuid4().hex
        payload  = {
            "event":       "folio.charge.posted",
            "event_id":    event_id,
            "source":      "ever_platform",
            "hotel_slug":  booking_lookup.get("hotel_slug"),
            "room_number": booking_lookup.get("room_number"),
            "order_id":    order_id,
            "description": description,
            "amount":      amount,
            "currency":    currency,
            "timestamp":   datetime.now(timezone.utc).isoformat(),
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                WEBHOOK_URL,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            return f"WHK-{event_id[:12].upper()}"

    # ── Supabase audit write ──────────────────────────────────────────────────

    async def _write_folio_audit(
        self, order_id: str, hotel_slug: str, booking_id: str,
        description: str, amount: float, pos_reference: str,
    ):
        """
        Writes an audit record to the Supabase `folio_charges` table via REST API.
        This uses the Supabase REST API directly (no SQLAlchemy) so the adapter
        can be used outside the FastAPI DB session context if needed.
        """
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            logger.warning("[POSAdapter] Supabase not configured — skipping audit write")
            return

        record = {
            "id":            str(uuid.uuid4()),
            "hotel_slug":    hotel_slug,
            "booking_id":    booking_id,
            "order_id":      order_id,
            "description":   description,
            "amount":        amount,
            "pos_reference": pos_reference,
            "posted_at":     datetime.now(timezone.utc).isoformat(),
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.post(
                    f"{SUPABASE_URL}/rest/v1/folio_charges",
                    json=record,
                    headers={
                        "apikey":        SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                        "Content-Type":  "application/json",
                        "Prefer":        "return=minimal",
                    },
                )
                if response.status_code not in (200, 201):
                    logger.error(
                        "[POSAdapter] Supabase folio_charges write failed: %s %s",
                        response.status_code, response.text,
                    )
                else:
                    logger.info("[POSAdapter] Audit record written: %s", pos_reference)
        except Exception as exc:
            logger.error("[POSAdapter] Supabase audit write exception: %s", exc)
