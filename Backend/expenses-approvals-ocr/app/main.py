from fastapi import FastAPI
from app.routes import expenses, ocr  # We’ll create these next

app = FastAPI(title="Expenses + Approvals + OCR API")

# Include routers
app.include_router(expenses.router, prefix="/api/expenses")
app.include_router(ocr.router, prefix="/api/ocr")

@app.get("/")
async def root():
    return {"message": "Expenses + OCR backend running!"}
