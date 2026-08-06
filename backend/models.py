from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    wardrobe_items: Mapped[list["WardrobeItem"]] = relationship(
        "WardrobeItem", back_populates="user", cascade="all, delete-orphan"
    )
    outfits: Mapped[list["Outfit"]] = relationship(
        "Outfit", back_populates="user", cascade="all, delete-orphan"
    )


class WardrobeItem(Base):
    __tablename__ = "wardrobe_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    image_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    thumbnail_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="wardrobe_items")
    outfit_items: Mapped[list["OutfitItem"]] = relationship(
        "OutfitItem", back_populates="wardrobe_item", cascade="all, delete-orphan"
    )


class Outfit(Base):
    __tablename__ = "outfits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="outfits")
    outfit_items: Mapped[list["OutfitItem"]] = relationship(
        "OutfitItem", back_populates="outfit", cascade="all, delete-orphan"
    )


class OutfitItem(Base):
    __tablename__ = "outfit_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    outfit_id: Mapped[int] = mapped_column(Integer, ForeignKey("outfits.id"), nullable=False)
    wardrobe_item_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("wardrobe_items.id"), nullable=False
    )

    outfit: Mapped["Outfit"] = relationship("Outfit", back_populates="outfit_items")
    wardrobe_item: Mapped["WardrobeItem"] = relationship(
        "WardrobeItem", back_populates="outfit_items"
    )
