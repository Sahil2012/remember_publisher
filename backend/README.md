# backend — Express 5 API + realtime dictation proxy

Part of [RememberPress](../README.md) · see also: [frontend](../frontend/README.md) · [landing-page](../landing-page/README.md)

TypeScript Express 5 service that owns everything server-side: the book/chapter/page CRUD API, AI text revamping, Stripe billing, public share links, image uploads, and a WebSocket proxy for live dictation. One Node process, shipped as a Docker container (persistent WebSockets rule out serverless).

```
src/
├── server.ts          # App wiring: raw-body capture → Clerk → routes → error handling
├── websocket.ts       # /api/dictate WS proxy → Deepgram nova-2
├── routes/            # Route tables — thin, middleware-first
├── middleware/        # Auth, ownership guards, Zod validation, error handler
├── controller/        # Request/response mapping
├── services/          # Business logic (usage, share snapshots, revamp, storage)
├── prompts/ config/   # LangChain prompt templates + LLM config
├── prisma/            # Schema + migrations (PostgreSQL)
└── exception/         # Typed HttpError hierarchy + error codes
```

## API surface

All authenticated routes carry a Clerk JWT; `resolveUser` maps it to the local `AppUser` row.

| Area | Routes | Notes |
|---|---|---|
| Auth | `GET /api/auth/me` | Creates the local user row on first call |
| Books | `POST/GET /api/books` · `GET/PATCH/DELETE /api/books/:id` · `GET /api/books/:id/full` | `/full` returns the populated book for export |
| Sharing | `POST /api/books/:id/publish` · `POST /api/books/:id/unpublish` | Subscriber-only; snapshot semantics below |
| Chapters | `GET/POST /api/chapters/:bookId` · `GET/PATCH/DELETE /api/chapters/:bookId/:id` · `PATCH .../pages/order` | Ownership checked via `verifyBookOwner` |
| Pages | `GET/POST /api/pages/chapter/:chapterId` · `GET/PATCH/DELETE /api/pages/:id` | Store Tiptap JSON + plain text; order is a DB invariant (`@@unique([chapterId, order])`), so reorders run as a two-phase transaction (negative offsets → finals) that never violates the constraint mid-flight |
| AI revamp | `POST /api/revamp/:bookId` · `POST /api/standalone-revamp` | In-book (category-aware) vs. standalone tool |
| Uploads | `POST /api/upload` | Busboy multipart → storage provider |
| Billing | `POST /api/stripe/create-checkout-session` · `create-portal-session` · `cancel` · `GET details` · `sync-subscription` · `POST webhook` | |
| Public | `GET /api/public/books/:shareId` | Unauthenticated; reads snapshots only |
| Realtime | `WS /api/dictate?token=<JWT>` | Live dictation, see below |

## Middleware chain: ownership is not controller code

Every protected route composes the same guards, so controllers never re-check "is this yours?":

```
requireAuth → resolveUser → validate({params, body})   # Zod schemas
           → verifyBookOwner | verifyChapterOwner | verifyPageOwner
           → requireSubscription                        # publish/unpublish only
```

Errors are a typed `HttpError` hierarchy (`NotFoundError`, `ForbiddenError`, `RateLimitExceededError`, …) with machine-readable error codes, funneled through a single error handler.

## The dictation proxy (`src/websocket.ts`)

The browser never talks to Deepgram. It streams 250 ms `audio/webm` chunks to `/api/dictate`, and the proxy:

1. **Authenticates manually** — WebSocket upgrades bypass Express middleware, so the Clerk JWT rides the query string and is verified with `verifyToken()` directly.
2. **Checks limits before opening the paid stream** — trial users get 5 lifetime minutes; subscribers 2 h/day (`UsageService`).
3. **Pre-buffers** — chunks that arrive before the Deepgram socket opens are queued (capped at 50) and flushed in order, so the author's first words survive the handshake.
4. **Relays transcripts** — interim and final results pass through as JSON; a 5 s keepalive holds the upstream open through pauses.
5. **Meters on close** — actual connected seconds are written back to the user's usage row.

Fatal errors (quota, auth) are sent as an error frame so the client knows *not* to auto-reconnect; transient drops trigger client-side reconnection with exponential backoff.

## Usage limits (`UsageService`)

One service enforces the business model for both HTTP and WebSocket entry points:

| | Free trial | Subscriber |
|---|---|---|
| AI revamps | 3 — lifetime | 40 / day |
| Dictation | 5 min — lifetime | 2 h / day |

Daily counters reset at midnight AEST (the customer base is Australian). Trial revamps are counted from persisted `AiRevampRecord` rows — the audit log doubles as the counter, so there's no separate state to drift.

## Share snapshots (`shareService`)

Publishing upserts a `PublishedSnapshot`: the full populated book, denormalized to JSON, under its own random `shareId`. The public endpoint reads only snapshots — never live tables — so drafts can't leak mid-edit and the public path does no ownership logic. Unpublish deletes the snapshot inside the same transaction that flips `isPublic`; revocation is instant.

## Stripe

- **Raw body first**: `express.json({ verify })` captures `req.rawBody` before Clerk or any other middleware runs, so `stripe.webhooks.constructEvent()` always verifies against unmodified bytes.
- **Two pricing shapes**: monthly is a Stripe subscription; yearly is a one-time payment.
- **Mode-switch resilience**: a stored customer ID that no longer resolves (test→live migration) is detected, cleared, and recreated instead of failing checkout.
- Webhook events are recorded as `Transaction` rows keyed by `stripeEventId` (unique), making processing idempotent.

## Storage

`StorageFactory` returns Supabase Storage when credentials exist, otherwise a local-disk provider serving from `/uploads` — a fresh clone handles image uploads with zero cloud setup.

## Environment

Copy `.env.example` → `.env`. Keys:

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port (default 5000) |
| `DATABASE_URL` / `DIRECT_URL` | Postgres (pooled / direct — Supabase) |
| `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Auth |
| `GEMINI_API_KEY` | AI revamp (LangChain → Gemini 2.5 Flash) |
| `DEEPGRAM_API_KEY` | Live dictation |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_BUCKET_NAME` | Image storage (optional — local fallback) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_ID` / `STRIPE_YEARLY_PRICE_ID` / `STRIPE_PUBLISHABLE_KEY` | Billing |

## Run

```bash
npm i
npx prisma generate
npm run dev        # tsx watch, http://localhost:5000

# production image
docker build -t rememberpress-api .
docker run -p 5000:5000 --env-file .env rememberpress-api
```
