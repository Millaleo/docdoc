# DocDoc Contigo MVP

Monorepo for the DocDoc Contigo MVP (frontend PWA + backend API + admin backoffice).

## Repository structure
- `frontend/` PWA routes for families
- `backend/` Express + Prisma API
- `admin/` staff backoffice web app
- `docs/` architecture and API notes

## Prerequisites
- Node.js 20+
- npm 10+
- Docker + Docker Compose

## 1) Setup
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
```

## 2) Start infrastructure + backend
```bash
docker compose up -d postgres
cd backend
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run dev
```
Backend on `http://localhost:3000`, Swagger on `http://localhost:3000/docs`.

Alternative with compose backend service:
```bash
docker compose up backend
```

## 3) Run frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend on `http://localhost:5173`.

## 4) Run admin
```bash
cd admin
npm install
npm run dev
```
Admin on `http://localhost:5174`.

## Default seed credentials
- Admin: `admin@docdoccontigo.cl` / `Admin1234!`
- Operator: `operator@docdoccontigo.cl` / `Operator1234!`

## Database and migration commands
```bash
cd backend
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
```

## Security highlights
- JWT access + refresh with rotation
- RBAC for user/staff/admin roles
- Family-scoped authorization checks
- Auth rate limiting
- Structured logs and audit log records

## Healthcheck
`GET /health`
