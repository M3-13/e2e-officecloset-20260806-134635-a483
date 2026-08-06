from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class WardrobeItemCreate(BaseModel):
    name: str
    category: str
    description: str | None = None


class WardrobeItemUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    description: str | None = None


class WardrobeItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    description: str | None
    image_url: str
    thumbnail_url: str
    created_at: datetime


class OutfitCreate(BaseModel):
    name: str
    item_ids: list[int]


class OutfitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    items: list[WardrobeItemOut]
    created_at: datetime
