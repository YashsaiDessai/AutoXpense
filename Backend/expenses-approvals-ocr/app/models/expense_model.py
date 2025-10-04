from pydantic import BaseModel, Field
from typing import Optional

class ExpenseSubmission(BaseModel):
    employee_id: str = Field(..., description="Unique employee ID")
    amount: float = Field(..., gt=0, description="Expense amount must be positive")
    currency: str = Field(..., description="Currency code, e.g., USD, INR")
    description: str = Field(..., description="Expense description")
    receipt_url: Optional[str] = Field(None, description="URL to uploaded receipt")

