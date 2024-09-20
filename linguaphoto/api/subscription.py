"""Collection API."""

import stripe
from crud.user import UserCrud
from fastapi import APIRouter, Depends, HTTPException
from settings import settings
from utils.auth import get_current_user_id

router = APIRouter()

stripe.api_key = settings.stripe_key

# Your existing price_id on Stripe
price_id = settings.stripe_price_id


@router.post("/create_subscription")
async def subscribe(data: dict, user_id: str = Depends(get_current_user_id), user_crud: UserCrud = Depends()) -> dict:
    try:
        # Create a customer if it doesn't exist
        customer = stripe.Customer.create(
            email=data["email"],
            name=data["name"],
            payment_method=data["payment_method_id"],
            invoice_settings={"default_payment_method": data["payment_method_id"]},
        )

        # Create a subscription for the customer
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{"price": price_id}],  # This is your existing product price ID
            expand=["latest_invoice.payment_intent"],
        )
        # Check if the subscription requires further action (e.g., 3D Secure)
        if subscription["latest_invoice"]["payment_intent"]["status"] == "requires_action":
            return {
                "requires_action": True,
                "payment_intent_client_secret": subscription["latest_invoice"]["payment_intent"]["client_secret"],
            }
        async with user_crud:
            await user_crud.update_user(user_id, {"is_subscription": True})
        return {"success": True}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
