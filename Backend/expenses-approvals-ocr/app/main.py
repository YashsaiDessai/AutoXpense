from fastapi import FastAPI
from .routes import expenses, ocr

app = FastAPI(title="Expenses + Approvals + OCR API")

# Include routes
app.include_router(expenses.router, prefix="/api/expenses")
app.include_router(ocr.router, prefix="/api/ocr")

@app.get("/")
async def root():
    return {"message": "Expenses + OCR backend running!"}
