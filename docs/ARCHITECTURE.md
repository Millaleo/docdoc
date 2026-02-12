# DocDoc Contigo MVP Architecture

## Overview
DocDoc Contigo is split into three deployable applications:
- **frontend**: mobile-first PWA for families.
- **backend**: REST API with authentication, RBAC, family domain, chat, tickets, documents, and audit.
- **admin**: backoffice UI for DocDoc operators.

## Stack
- Backend: Node.js + TypeScript + Express + Prisma + PostgreSQL
- Auth: JWT access/refresh with rotation-ready token storage
- Validation: Zod
- API docs: OpenAPI 3 + Swagger UI at `/docs`
- Frontends: React + TypeScript + Vite
- Runtime: Docker Compose for PostgreSQL + backend

## Security model
- JWT bearer access token for API authorization
- Refresh tokens are persisted and revocable
- RBAC roles: USER_EXTERNAL, STAFF_OPERATOR, STAFF_CLINICAL, ADMIN_SYSTEM
- Family-scoped authorization checks to avoid IDOR
- Structured request logging with request id
- Rate-limit for `/auth/*`
- Audit trail for sensitive actions

## Data model domains
- Users and sessions
- Families and members with permission flags
- Plans, subscriptions, and plan benefits
- Conversations and messages with attachment metadata
- Tickets with event timeline
- Documents repository
- AuditLog records

## Local environment
- `docker-compose` runs PostgreSQL + backend
- frontend/admin run with Vite on local ports
