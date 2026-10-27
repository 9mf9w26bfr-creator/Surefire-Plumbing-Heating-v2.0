# Backend Architecture Notice

As approved in the project audit:
This platform uses the **Next.js Fullstack Architecture** (App Router Route Handlers located in `src/app/api/`) directly integrated with **Prisma ORM** (`prisma/schema.prisma`) and TypeScript types (`src/types/`).

Active API endpoints:
- `POST /api/bookings` & `GET /api/bookings`
- `GET/PATCH/DELETE /api/bookings/[id]`
- `POST /api/upload` (Local static file hosting in `/public/uploads/`)
- `POST /api/auth/register`, `/api/auth/verify`, `/api/auth/login`
- `POST /api/estimate`
- `GET/POST /api/join/application`
- `GET /api/availability`
