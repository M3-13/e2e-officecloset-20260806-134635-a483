from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/api/outfits")
async def list_outfits():
    raise HTTPException(status_code=501, detail="outfits #6 implements this")


@router.post("/api/outfits")
async def create_outfit():
    raise HTTPException(status_code=501, detail="outfits #6 implements this")


@router.get("/api/outfits/{id}")
async def get_outfit(id: int):
    raise HTTPException(status_code=501, detail="outfits #6 implements this")


@router.delete("/api/outfits/{id}")
async def delete_outfit(id: int):
    raise HTTPException(status_code=501, detail="outfits #6 implements this")
