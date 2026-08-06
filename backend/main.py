import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from auth import router as auth_router
from config import Settings
from database import Base, engine
from routers.outfits import router as outfits_router
from routers.wardrobe import router as wardrobe_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = Settings()
    app.state.settings = settings
    _ = settings.database_url
    _ = settings.upload_dir
    _ = settings.frontend_origin
    Base.metadata.create_all(bind=engine)
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="Hollywood Closet API", lifespan=lifespan)

settings = Settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(wardrobe_router)
app.include_router(outfits_router)

upload_dir = Path(settings.upload_dir)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/api/images", StaticFiles(directory=str(upload_dir)), name="images")


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@app.get("/api/health")
async def health():
    return {"status": "ok"}
