---
name: Server-side auth and upload pattern
description: Why and how session checks and file uploads must go through server-side API routes on Replit (unregistered domain).
---

# Server-side auth and upload pattern

## The rule
Never call `account.get()` in `checkSession`, and never call `storage.createFile()` directly from client components. Both fail on domains not registered as Appwrite platforms (e.g. Replit preview).

**Why:** The Appwrite client SDK enforces platform/domain allowlisting for browser calls. `account.get()` returns `general_unauthorized_scope`; `storage.createFile()` returns "not authorized". Server-to-server calls (node-appwrite with API key) bypass this entirely.

**How to apply:**
- Session check → `authFetch('/api/auth/me')` in `checkSession` (PostContext.tsx). The endpoint uses `getSessionUser()` + `getAdminUsers().get(userId)` + `getAdminDatabases().getDocument()`.
- File uploads → `uploadViaServer(file, bucketId)` from `src/lib/upload.ts`. The helper POSTs multipart to `/api/upload`, which proxies directly to the Appwrite REST API using `APPWRITE_API_KEY` (node-appwrite v14 has no `InputFile` export).
- The server uploader must copy incoming file bytes into a standard `Blob` before building the outgoing multipart request; this avoids Appwrite 1.6's `source.on is not a function` mismatch between web `File` objects and Node upload streams.
- Both new endpoints live in `src/server/api-impl/root/auth/me.ts` and `src/server/api-impl/root/upload/index.ts`, registered in the ROUTES map in `src/app/api/[...path]/route.ts`.
- `src/lib/session.ts` `getSessionUser()` reads `X-Appwrite-Session` (sent by `authFetch`) or `Authorization: Bearer <jwt>`.
