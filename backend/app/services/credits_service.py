from fastapi import HTTPException
from .supabase_service import supabase
import logging

logger = logging.getLogger(__name__)

class CreditsService:
    @staticmethod
    async def get_user_credits(user_id: str) -> int:
        try:
            response = supabase.from_('users').select('credits').eq('id', user_id).single().execute()
            if not response.data:
                return 0
            return response.data['credits']
        except Exception as e:
            logger.error(f"Error getting credits: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to get user credits")

    @staticmethod
    async def deduct_credit(user_id: str) -> bool:
        try:
            # Get current credits
            current_credits = await CreditsService.get_user_credits(user_id)
            
            if current_credits <= 0:
                raise HTTPException(status_code=403, detail="Insufficient credits")
            
            # Update credits
            supabase.from_('users').update({'credits': current_credits - 1}).eq('id', user_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deducting credit: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to deduct credit")

    @staticmethod
    async def add_credits(user_id: str, amount: int) -> bool:
        try:
            current_credits = await CreditsService.get_user_credits(user_id)
            supabase.from_('users').update({'credits': current_credits + amount}).eq('id', user_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error adding credits: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to add credits") 