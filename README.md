# Hollywood Closet – Glamorous Wardrobe Manager

An elegant wardrobe manager with a web GUI in Hollywood style. Users register, create
clothing items with images and categories, browse their wardrobe, and combine items into
saved outfits in the Outfit Creator.

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, SQLite, python-jose, passlib[bcrypt]
- **Frontend**: React 18+, Vite, TypeScript, React Router v6
- **Runtime**: `backend/` as FastAPI service, `frontend/` as Vite dev server

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | _(none – external)_ | JWT signing secret (required for auth) |
| `DATABASE_URL` | `sqlite:///./closet.db` | Database connection string |
| `UPLOAD_DIR` | `backend/uploads` | Upload directory for clothing images |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Frontend origin for CORS |

You can also place a `.env` file in the `backend/` directory.

## Running in Dev

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The API is available at `http://localhost:8000`.

## API Endpoints

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check, returns `{"status": "ok"}` |

### Auth (`/api/auth`)

| Method | Path | Body | Auth | Response |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | `{email, password}` | No | 201 `{access_token, token_type}` |
| `POST` | `/api/auth/login` | `{email, password}` | No | 200 `{access_token, token_type}` |

### Wardrobe (`/api/wardrobe`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/wardrobe/items` | Yes | List all wardrobe items |
| `POST` | `/api/wardrobe/items` | Yes | Create item (multipart: name, category, description?, image) |
| `GET` | `/api/wardrobe/items/{id}` | Yes | Get single item |
| `PUT` | `/api/wardrobe/items/{id}` | Yes | Update item |
| `DELETE` | `/api/wardrobe/items/{id}` | Yes | Delete item |
| `GET` | `/api/wardrobe/images/{id}/full` | Yes | Full-size image |
| `GET` | `/api/wardrobe/images/{id}/thumb` | Yes | Thumbnail image |

### Outfits (`/api/outfits`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/outfits` | Yes | List all outfits |
| `POST` | `/api/outfits` | Yes | Create outfit `{name, item_ids}` |
| `GET` | `/api/outfits/{id}` | Yes | Get single outfit |
| `DELETE` | `/api/outfits/{id}` | Yes | Delete outfit |

## Features

- User registration and login with JWT authentication
- Wardrobe management: create, read, update, delete clothing items
- Image upload with automatic thumbnail generation
- Category-based filtering
- Outfit Creator: combine clothing items into saved outfits
- Per-user data isolation with owner checks
