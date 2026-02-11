# Technical Decisions & Assumptions

## Decisions
1. **Express chosen over NestJS** for delivery speed while preserving modular architecture.
2. **Email+password auth for MVP**, with OTP-ready fields (`emailVerified`, optional `otp*` extension path) to support future passwordless flow.
3. **Local file storage adapter for dev** with signed URL placeholders and environment-driven storage path; interface can be replaced by S3-compatible implementation.
4. **Prisma with SQL migration checked-in** for reproducible schema setup.
5. **Simple UI implementation** focused on functional route coverage, not advanced styling.

## Assumptions
- A family has one titular (`holderUserId`) and up to `maxMembers` (default 5).
- Invite acceptance links use opaque random tokens and optional invitee email validation.
- Staff users are seeded and can access admin endpoints via same auth API.
- Chat attachments are metadata references in MVP; upload endpoint stores files locally.
- Subscription module is view-first for users; CRUD managed by admin.
- Payment history is represented minimally by `Payment` records.

## Non-goals in MVP
- Real-time chat (polling only).
- Medical diagnosis logic.
- Advanced billing integrations.
