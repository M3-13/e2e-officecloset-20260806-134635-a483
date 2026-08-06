from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/api/wardrobe/items")
async def list_items():
    raise HTTPException(status_code=501, detail="wardrobe #7 implements this")


@router.post("/api/wardrobe/items")
async def create_item():
    raise HTTPException(status_code=501, detail="wardrobe #7 implements this")


@router.get("/api/wardrobe/items/{id}")
async def get_item(id: int):
    raise HTTPException(status_code=501, detail="wardrobe #7 implements this")


@router.put("/api/wardrobe/items/{id}")
async def update_item(id: int):
    raise HTTPException(status_code=501, detail="wardrobe #7 implements this")


@router.delete("/api/wardrobe/items/{id}")
async def delete_item(id: int):
    raise HTTPException(status_code=501, detail="wardrobe #7 implements this")


@router.get("/api/wardrobe/images/{id}/full")
async def get_full_image(id: int):
    raise HTTPException(status_code=501, detail="wardrobe #7 implements this")


@router.get("/api/wardrobe/images/{id}/thumb")
async def get_thumbnail(id: int):
    raise HTTPException(status_code=501, detail="wardrobe #7 implements this")
