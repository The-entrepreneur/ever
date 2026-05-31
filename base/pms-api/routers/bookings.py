"""
routers/bookings.py — POST /api/v1/bookings/create
Creates a booking record and generates a payment link (Paystack/Flutterwave).
"""
import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import date

from auth import verify_api_key
from database import get_db
from models.booking import BookingRequest, BookingResponse

router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])

PAYMENT_PROVIDER = os.getenv("PAYMENT_PROVIDER", "paystack").lower()
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "")
FLUTTERWAVE_SECRET_KEY = os.getenv("FLUTTERWAVE_SECRET_KEY", "")
HOTEL_NAME    = os.getenv("HOTEL_NAME", "Hotel")
WEBHOOK_BASE  = os.getenv("WEBHOOK_BASE_URL", "https://example.com")


def _nights_between(check_in: str, check_out: str) -> int:
    d1 = date.fromisoformat(check_in)
    d2 = date.fromisoformat(check_out)
    return max(1, (d2 - d1).days)


@router.post("/create", response_model=BookingResponse, dependencies=[Depends(verify_api_key)])
async def create_booking(req: BookingRequest, db: AsyncSession = Depends(get_db)):
    # Look up room rate from DB (fallback to 129.0 if DB unavailable)
    rate = 129.0
    try:
        result = await db.execute(
            text("SELECT rate_per_night FROM rooms WHERE room_id = :room_id"),
            {"room_id": req.room_id}
        )
        row = result.fetchone()
        if row:
            rate = float(row[0])
    except Exception:
        pass

    nights = _nights_between(req.check_in, req.check_out)
    total  = round(rate * nights, 2)

    # Persist booking record
    try:
        await db.execute(
            text("""
                INSERT INTO bookings
                    (booking_ref, room_id, guest_name, email, phone,
                     check_in, check_out, guests, total, status)
                VALUES
                    (:ref, :room, :name, :email, :phone,
                     :ci::date, :co::date, :guests, :total, 'pending_payment')
                ON CONFLICT (booking_ref) DO NOTHING
            """),
            {
                "ref":    req.booking_ref,
                "room":   req.room_id,
                "name":   req.name,
                "email":  req.email,
                "phone":  req.phone,
                "ci":     req.check_in,
                "co":     req.check_out,
                "guests": req.guests,
                "total":  total,
            }
        )
        await db.commit()
    except Exception:
        await db.rollback()

    payment_link = None
    
    # Generate Checkout session based on provider
    try:
        async with httpx.AsyncClient() as client:
            if PAYMENT_PROVIDER == "paystack" and PAYSTACK_SECRET_KEY and not PAYSTACK_SECRET_KEY.startswith("sk_test_your_"):
                res = await client.post(
                    "https://api.paystack.co/transaction/initialize",
                    headers={"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"},
                    json={
                        "email": req.email,
                        "amount": int(total * 100),  # pence/kobo
                        "reference": req.booking_ref,
                        "callback_url": f"{WEBHOOK_BASE}/payment/success?ref={req.booking_ref}"
                    }
                )
                if res.status_code == 200:
                    payment_link = res.json()["data"]["authorization_url"]
                else:
                    print(f"[PMS] Paystack init error: {res.text}")

            elif PAYMENT_PROVIDER == "flutterwave" and FLUTTERWAVE_SECRET_KEY and not FLUTTERWAVE_SECRET_KEY.startswith("FLWSECK_TEST-your_"):
                res = await client.post(
                    "https://api.flutterwave.com/v3/payments",
                    headers={"Authorization": f"Bearer {FLUTTERWAVE_SECRET_KEY}"},
                    json={
                        "tx_ref": req.booking_ref,
                        "amount": total,
                        "currency": "GBP",
                        "redirect_url": f"{WEBHOOK_BASE}/payment/success?ref={req.booking_ref}",
                        "customer": {
                            "email": req.email,
                            "name": req.name,
                            "phonenumber": req.phone or ""
                        },
                        "customizations": {
                            "title": f"{HOTEL_NAME} Booking"
                        }
                    }
                )
                if res.status_code == 200:
                    payment_link = res.json()["data"]["link"]
                else:
                    print(f"[PMS] Flutterwave init error: {res.text}")
    except Exception as e:
        print(f"[PMS] Payment link generation error: {e}")

    return BookingResponse(
        booking_id=f"BK_{req.booking_ref}",
        booking_ref=req.booking_ref,
        room_id=req.room_id,
        check_in=req.check_in,
        check_out=req.check_out,
        guests=req.guests,
        total=total,
        payment_link=payment_link,
    )
