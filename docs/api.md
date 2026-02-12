# API Endpoints (MVP)

## Health & docs
- `GET /health`
- `GET /docs`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Family
- `POST /family/create`
- `GET /family`
- `POST /family/:familyId/members`
- `POST /family/:familyId/invites`
- `POST /family/invites/accept`

## Subscription & plans
- `GET /subscription/:familyId`
- `GET /admin/plans`
- `POST /admin/plans`
- `POST /admin/plans/:planId/benefits`

## Chat
- `GET /chat/conversations`
- `POST /chat/conversations`
- `GET /chat/conversations/:id/messages`
- `POST /chat/conversations/:id/messages`
- `POST /chat/admin/conversations/:id/assign`

## Tickets
- `GET /tickets`
- `POST /tickets`
- `GET /tickets/:id`
- `PATCH /admin/tickets/:id`

## Documents
- `GET /documents/:familyId`
- `POST /documents`
- `POST /admin/documents`

## Admin
- `GET /admin/families`
- `GET /admin/audit`
