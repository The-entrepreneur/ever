"""
routers/payments.py — POST /api/v1/payments/webhook
Paystack and Flutterwave webhook handler. Validates signature, confirms booking in DB,
and releases Redis room hold automatically.
"""
import os
import hmac
import hashlib
from fastapi import APIRouter, Request, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from fastapi import Depends

from auth import verify_api_key
from database import get_db

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])

PAYMENT_PROVIDER = os.getenv("PAYMENT_PROVIDER", "paystack").lower()
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "")
FLUTTERWAVE_SECRET_HASH = os.getenv("FLUTTERWAVE_SECRET_HASH", "")


@router.post("/webhook")
async def payment_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Called by Paystack or Flutterwave directly after payment.
    NOT protected by X-API-Key — protected by webhook signatures.
    """
    payload_bytes = await request.body()
    headers = request.headers

    booking_ref = None
    is_successful = False

    if PAYMENT_PROVIDER == "paystack":
        signature = headers.get("x-paystack-signature")
        if not signature:
            raise HTTPException(status_code=400, detail="Missing signature")
            
        expected_sig = hmac.new(
            PAYSTACK_SECRET_KEY.encode("utf-8"),
            payload_bytes,
            hashlib.sha512
        ).hexdigest()
        
        if signature != expected_sig:
            raise HTTPException(status_code=400, detail="Invalid signature")
            
        data = await request.json()
        if data.get("event") == "charge.success" and data.get("data", {}).get("status") == "success":
            booking_ref = data["data"].get("reference")
            is_successful = True

    elif PAYMENT_PROVIDER == "flutterwave":
        signature = headers.get("verif-hash")
        if not signature or signature != FLUTTERWAVE_SECRET_HASH:
            raise HTTPException(status_code=400, detail="Invalid signature")
            
        data = await request.json()
        if data.get("event") == "charge.completed" and data.get("data", {}).get("status") == "successful":
            booking_ref = data["data"].get("tx_ref")
            is_successful = True

    if booking_ref and is_successful:
        try:
            # Confirm booking in database
            await db.execute(
                text("""
                    UPDATE bookings
                    SET status = 'confirmed', confirmed_at = NOW()
                    WHERE booking_ref = :ref
                """),
                {"ref": booking_ref}
            )
            await db.commit()
            print(f"[PMS] Booking confirmed via {PAYMENT_PROVIDER}: {booking_ref}")
        except Exception as e:
            await db.rollback()
            print(f"[PMS] DB confirm error: {e}")

    return {"received": True}


@router.post("/process", dependencies=[Depends(verify_api_key)])
async def process_payment(booking_ref: str, db: AsyncSession = Depends(get_db)):
    """
    Internal endpoint called by bot-engine to retrieve payment status.
    """
    try:
        result = await db.execute(
            text("SELECT status FROM bookings WHERE booking_ref = :ref"),
            {"ref": booking_ref}
        )
        row = result.fetchone()
        if row:
            return {"booking_ref": booking_ref, "status": row[0]}
    except Exception:
        pass
    return {"booking_ref": booking_ref, "status": "unknown"}
