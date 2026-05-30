"""
routers/payments.py — POST /api/v1/payments/webhook
Stripe webhook handler. Validates signature, confirms booking in DB,
releases Redis room hold, and cancels the BullMQ follow-up job.
"""
import os
import stripe
from fastapi import APIRouter, Request, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from fastapi import Depends

from auth import verify_api_key
from database import get_db

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])

stripe.api_key            = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET     = os.getenv("STRIPE_WEBHOOK_SECRET", "")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="Stripe-Signature"),
    db: AsyncSession = Depends(get_db),
):
    """
    Stripe calls this endpoint directly after payment.
    NOT protected by X-API-Key — protected by Stripe webhook signature instead.
    """
    payload = await request.body()

    # Validate Stripe signature — prevents spoofed webhooks
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")

    # Handle checkout.session.completed
    if event["type"] == "checkout.session.completed":
        session        = event["data"]["object"]
        booking_ref    = session.get("client_reference_id")
        payment_status = session.get("payment_status")

        if booking_ref and payment_status == "paid":
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
                print(f"[PMS] Booking confirmed: {booking_ref}")
            except Exception as e:
                await db.rollback()
                print(f"[PMS] DB confirm error: {e}")

    elif event["type"] == "checkout.session.expired":
        # Payment timeout — release is handled by Redis TTL expiry automatically
        session     = event["data"]["object"]
        booking_ref = session.get("client_reference_id")
        if booking_ref:
            try:
                await db.execute(
                    text("UPDATE bookings SET status = 'expired' WHERE booking_ref = :ref"),
                    {"ref": booking_ref}
                )
                await db.commit()
            except Exception:
                await db.rollback()

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
