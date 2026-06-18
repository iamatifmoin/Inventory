# Inventory & Order Management System

A full-stack inventory and order management app for tracking products, customers, and orders. The web UI (**Inventory OS**) provides a dashboard with at-a-glance metrics, CRUD for products and customers, and order creation with automatic stock updates.

## Screenshots

| Dashboard | Products |
| --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Products](docs/screenshots/products.png) |

| Customers | Orders |
| --- | --- |
| ![Customers](docs/screenshots/customers.png) | ![Orders](docs/screenshots/orders.png) |

## Features

- **Dashboard** — summary stats (products, customers, orders, low-stock items) and recent orders
- **Products** — create, edit, and delete products with SKU, price, and stock quantity
- **Customers** — manage customer records (name, email, phone)
- **Orders** — place orders against customers and products; stock is adjusted automatically; orders can be cancelled with stock restored
- **REST API** — FastAPI backend with interactive docs at `/docs`

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Query, React Hook Form, Zod |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Alembic, Pydantic |
| Database | PostgreSQL 16 |

## Project Structure

```
Inventory/
├── backend/          # FastAPI API, models, migrations, seed data
├── frontend/         # React SPA (Vite)
├── docker-compose.yml
└── .env.example      # Shared env vars for Docker Compose
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (recommended), **or**
- Node.js 20+, Python 3.12+, and PostgreSQL 16 for local development

## Quick Start (Docker)

1. Copy the root environment file and adjust values if needed:

   ```bash
   cp .env.example .env
   ```

2. Start all services (database, API, and frontend):

   ```bash
   docker compose up --build
   ```

3. Open the app:

   | Service | URL |
   | --- | --- |
   | Frontend | http://localhost:5173 |
   | API | http://localhost:8000 |
   | API docs (Swagger) | http://localhost:8000/docs |

On first startup the backend runs migrations and seeds sample products, customers, and orders.

## Local Development

### 1. Database

Start PostgreSQL. The easiest option is to run only the database container:

```bash
docker compose up db
```

Default connection: `postgresql://postgres:postgres@localhost:5432/inventory_db`

### 2. Backend

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` if your database credentials differ from the defaults.

Run migrations, seed sample data, and start the API:

```bash
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The dev server runs at http://localhost:5173 and expects the API at `http://localhost:8000` (configured via `VITE_API_BASE_URL` in `frontend/.env`).

## Environment Variables

### Root (`.env`) — Docker Compose

| Variable | Description | Default |
| --- | --- | --- |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | — |
| `POSTGRES_DB` | Database name | `inventory_db` |
| `VITE_API_BASE_URL` | API URL baked into the frontend build | `http://localhost:8000` |

### Backend (`backend/.env`)

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `ENVIRONMENT` | `development` or `production` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |

### Frontend (`frontend/.env`)

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL |

## API Overview

| Resource | Endpoints |
| --- | --- |
| Products | `GET/POST /products`, `GET/PUT/DELETE /products/{id}` |
| Customers | `GET/POST /customers`, `GET/DELETE /customers/{id}` |
| Orders | `GET/POST /orders`, `GET/DELETE /orders/{id}` |
| Dashboard | `GET /dashboard/summary` |
| Health | `GET /health` |

Full interactive documentation is available at http://localhost:8000/docs when the backend is running.

## Scripts

### Frontend (`frontend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend (`backend/`)

| Command | Description |
| --- | --- |
| `alembic upgrade head` | Apply database migrations |
| `python -m app.seed` | Seed sample data (skips if data already exists) |
| `uvicorn app.main:app --reload` | Start API with auto-reload |
