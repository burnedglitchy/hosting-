# MPanel

MPanel is a production-oriented scaffold for a Minecraft server hosting platform. It includes a Node.js/Express API, PostgreSQL/Prisma data model, a React/Vite/Tailwind frontend, a mock-first Pterodactyl integration layer, and Docker Compose for local development.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, CommonJS |
| Database | PostgreSQL with Prisma ORM |
| Auth | Email/password with bcrypt + JWT httpOnly cookie, Google Identity Services ID-token verification |
| Provisioning | Pterodactyl Panel Application API via `PterodactylService` |
| Payments | Fake instant-success checkout with TODO hooks for Razorpay |
| Local runtime | Docker Compose: Postgres, backend, frontend |

## Repository layout

```text
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── .env.example
│   └── package.json
├── Dockerfile.backend
├── Dockerfile.frontend
└── docker-compose.yml
```

## Prerequisites

For local development without Docker:

- Node.js 20+
- npm 10+
- PostgreSQL 16+

For Docker-based development:

- Docker
- Docker Compose v2+

## Environment configuration

### Backend

Copy the backend env example and edit values as needed:

```bash
cp backend/.env.example backend/.env
```

Important backend variables:

| Variable | Purpose | Default/example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma | `postgresql://mpanel:mpanel@postgres:5432/mpanel?schema=public` |
| `JWT_SECRET` | Secret used to sign JWTs stored in httpOnly cookies | `change-me` |
| `COOKIE_SECURE` | Set to `true` behind HTTPS in production | `false` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `ADMIN_EMAIL` | Seeded admin email | `admin@mpanel.local` |
| `ADMIN_PASSWORD` | Seeded admin password | `admin12345` |
| `PTERODACTYL_MODE` | `MOCK` or `LIVE`; mock mode makes no panel HTTP calls | `MOCK` |
| `PTERODACTYL_PANEL_URL` | Pterodactyl panel URL for live mode | `https://panel.example.com` |
| `PTERODACTYL_API_KEY` | Pterodactyl Application API key for live mode | `ptla_xxx` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | empty |

> Keep `PTERODACTYL_MODE=MOCK` during local development unless you intentionally want to call a real Pterodactyl panel.

### Frontend

Copy the frontend env example and edit values as needed:

```bash
cp frontend/.env.example frontend/.env
```

Important frontend variables:

| Variable | Purpose | Default/example |
| --- | --- | --- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID exposed to the browser | empty |

## Quick start with Docker Compose

1. Copy environment files:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Start services:

   ```bash
   docker compose up --build
   ```

3. In a second terminal, run database migrations and seed data inside the backend container:

   ```bash
   docker compose exec backend npx prisma migrate dev --name init
   docker compose exec backend npm run seed
   ```

4. Open the app:

   - Frontend: <http://localhost:5173>
   - Backend health check: <http://localhost:4000/health>

5. Log in with the seeded admin credentials from your backend env file. With the example values:

   ```text
   Email: admin@mpanel.local
   Password: admin12345
   ```

## Local development without Docker

### 1. Start PostgreSQL

Create a local database and set `backend/.env` accordingly. Example:

```bash
createdb mpanel
```

Use a local URL such as:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/mpanel?schema=public"
```

### 2. Install backend dependencies

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

The backend runs on <http://localhost:4000> by default.

### 3. Install frontend dependencies

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on <http://localhost:5173> by default.

## Seeded plans

The seed script creates these active plans:

| Plan | Price | RAM | Disk | Featured |
| --- | ---: | ---: | ---: | --- |
| Starter | `$3/mo` | 2 GB | 10 GB | No |
| Pro | `$8/mo` | 6 GB | 30 GB | Yes |
| Extreme | `$16/mo` | 16 GB | 100 GB | No |

The seed script also creates one admin user if `ADMIN_EMAIL` does not already exist.

## Authentication notes

- JWTs are set only as httpOnly cookies by the backend.
- The frontend does not store JWTs in local storage, session storage, or any JavaScript-accessible location.
- Failed login returns a generic error to avoid leaking whether an email is registered.
- Google login expects a Google Identity Services credential and verifies the ID token server-side.

## Pterodactyl integration modes

All provisioning and server lifecycle operations go through:

```text
backend/src/services/PterodactylService.js
```

### MOCK mode

```env
PTERODACTYL_MODE="MOCK"
```

- Default and recommended for development.
- Returns fake incrementing user/server IDs.
- Generates mock stats.
- Makes no real network calls to Pterodactyl.

### LIVE mode

```env
PTERODACTYL_MODE="LIVE"
PTERODACTYL_PANEL_URL="https://your-panel.example.com"
PTERODACTYL_API_KEY="ptla_your_application_api_key"
```

- Calls `{PTERODACTYL_PANEL_URL}/api/application` using Bearer auth.
- No code outside `PterodactylService` should call the Pterodactyl panel directly.
- Confirm egg, Docker image, startup command, allocation/location values, and API permissions before enabling live mode.

## Payment flow

Current checkout behavior is intentionally fake and instant-success:

1. User selects a plan.
2. User enters server name/location.
3. Backend validates the plan.
4. Backend records an order as paid with provider `FAKE_INSTANT_SUCCESS`.
5. Backend provisions the Pterodactyl user/server through `PterodactylService`.
6. Backend returns the created server.

If provisioning fails after the fake payment record is created, the API marks the order as `FAILED` and returns a clear support message with the order ID.

Razorpay is not implemented. The checkout route contains the intended TODO integration point for future order creation and signature verification.

## Useful commands

### Backend

```bash
cd backend
npm run dev
npm start
npm run seed
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run preview
```

### Docker

```bash
docker compose up --build
docker compose down
docker compose exec backend npm run seed
docker compose exec backend npx prisma migrate dev --name init
```

## API overview

### Auth

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register with email/password |
| `POST` | `/api/auth/login` | Login with email/password |
| `POST` | `/api/auth/google` | Login/register with a Google ID token |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Return the authenticated user |

### Plans

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/plans` | Public list of active plans |

### Servers

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/servers` | List current user's servers |
| `GET` | `/api/servers/:id` | Get one owned server |
| `GET` | `/api/servers/:id/stats` | Get mocked live stats |
| `POST` | `/api/servers/:id/power` | Mock start/stop/restart action |

### Checkout

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/checkout` | Fake payment + provision server |

### Admin

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/plans` | List all plans |
| `POST` | `/api/admin/plans` | Create plan |
| `PATCH` | `/api/admin/plans/:id` | Update plan |
| `DELETE` | `/api/admin/plans/:id` | Soft-delete plan |
| `GET` | `/api/admin/users` | List users without sensitive fields |
| `PATCH` | `/api/admin/users/:id/role` | Change user role |
| `GET` | `/api/admin/servers` | List all servers |
| `PATCH` | `/api/admin/servers/:id/status` | Suspend, unsuspend, or terminate server |
| `PATCH` | `/api/admin/servers/:id/plan` | Change server plan |

## Production notes

Before production deployment:

- Replace `JWT_SECRET` with a strong secret.
- Set `COOKIE_SECURE=true` behind HTTPS.
- Configure a trusted production `FRONTEND_URL`.
- Use managed PostgreSQL or persistent Postgres volumes with backups.
- Keep `PTERODACTYL_API_KEY` out of source control.
- Verify all live Pterodactyl settings before switching `PTERODACTYL_MODE` to `LIVE`.
- Replace fake checkout with real payment order creation and signature verification.
- Add CI checks for linting, type checking, backend tests, frontend build, and Docker image builds.
