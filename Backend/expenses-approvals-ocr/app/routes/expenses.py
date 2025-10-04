from fastapi import APIRouter, HTTPException
from ..models.expense_model import ExpenseSubmission
from ..services.exchange_service import convert_to_base_currency

router = APIRouter()

@router.post("/submit")
async def submit_expense(expense: ExpenseSubmission):
    # Validate input is already done by Pydantic
    try:
        converted_amount = await convert_to_base_currency(expense.amount, expense.currency)
        # Here, save to Supabase (pseudo-code)
        # supabase.table("expenses").insert({...})
        return {
            "message": "Expense submitted successfully!",
            "original_amount": expense.amount,
            "converted_amount": converted_amount
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting expense: {str(e)}")
