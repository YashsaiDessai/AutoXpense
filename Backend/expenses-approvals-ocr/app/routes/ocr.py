from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_ocr():
    return {"message": "OCR route working!"}