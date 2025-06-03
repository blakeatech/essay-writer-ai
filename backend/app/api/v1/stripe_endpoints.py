from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from app.utils.auth import get_current_user
from app.core.config import settings
import stripe
import logging
from app.services.supabase_service import supabase

# Import rate limiting components
from slowapi import Limiter
from slowapi.util import get_remote_address

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Set up logging
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create router
router = APIRouter(prefix="/api/v1")

class CheckoutData(BaseModel):
    quantity: int

@router.post("/create-checkout-session")
@limiter.limit("10/minute")  # Limit to 10 requests per minute per IP
async def create_checkout_session(
    request: Request,  # Required for rate limiting
    data: CheckoutData,
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe checkout session for purchasing credits"""
    try:
        # Log authentication info
        logger.info(f"Creating checkout session for user: {current_user['id']}")
        
        # Get user info
        user_id = current_user["id"]
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                'price': settings.STRIPE_PRICE_ID,
                'quantity': data.quantity,
            }],
            mode='payment',
            success_url=f'{settings.FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{settings.FRONTEND_URL}/dashboard/buy-credits',
            metadata={
                'user_id': user_id,
                'credit_amount': data.quantity
            }
        )
        
        return {"url": checkout_session.url}
    
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
# No rate limiting for webhooks as they come from Stripe
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    try:
        # Get the webhook signature and payload
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        # Verify the webhook signature
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            
            # Get user ID and credit amount from metadata
            user_id = session['metadata']['user_id']
            credit_amount = int(session['metadata']['credit_amount'])
            
            # Add credits to user's account
            await add_credits_to_user(user_id, credit_amount)
            
            logger.info(f"Added {credit_amount} credits to user {user_id}")
        
        return {"status": "success"}
    
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

async def add_credits_to_user(user_id: str, credit_amount: int):
    """Add credits to a user's account"""
    try:
        # Get current credits
        response = supabase.table("user_profiles").select("credits").eq("id", user_id).execute()
        
        if not response.data:
            # Create profile if it doesn't exist
            supabase.table("user_profiles").insert({
                "id": user_id,
                "credits": credit_amount
            }).execute()
        else:
            # Update existing profile
            current_credits = response.data[0]["credits"] or 0
            new_credits = current_credits + credit_amount
            
            supabase.table("user_profiles").update({
                "credits": new_credits
            }).eq("id", user_id).execute()
        
    except Exception as e:
        logger.error(f"Error adding credits: {str(e)}", exc_info=True)
        raise e
