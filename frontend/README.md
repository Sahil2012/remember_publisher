# frontend — the author app

Part of [RememberPress](../README.md) · see also: [backend](../backend/README.md) · [landing-page](../landing-page/README.md)

React 19 + Vite SPA where books get written: a page-true Tiptap editor with live dictation, AI rewriting, drag-and-drop page ordering, and client-side print/PDF export. Clerk for auth, TanStack Query for server state, Tailwind v4 + shadcn/ui for the interface.

## Screens

| Route | Screen |
|---|---|
| `/library` | Book library — create, browse, delete books |
| `/book/:id` | Book details — chapters, cover, share & export |
| `/book/:bookId/chapter/:chapterId` | Chapter editor — the core writing surface |
| `/revamp` | Standalone AI revamp tool (paste → rewrite in a tone) |
| `/guides` | Writing guides |
| `/billing` | Subscription management (Stripe checkout + portal) |
| `/read/:shareId` | Public reader — no auth, renders published snapshots |
| `/login` · `/signup` · `/sso-callback` | Clerk auth flows |

Route guards nest in `src/router.tsx`: `PublicRoute` (redirects signed-in users to the library) and `ProtectedRoute → SubscriptionGuard → Layout` for the app proper. The public reader sits outside both — it must work for anyone holding a share link.

## The editor (`TiptapEditor`)

The design constraint driving everything: **a page on screen is a page in print.**

- The editor simulates A4 printable height (`MAX_PAGE_HEIGHT`); a ProseMirror resize observer fires an overflow callback the moment content exceeds it, and the UI warns the author instead of silently reflowing.
- Custom Tiptap extensions: `LineHeight` (per-paragraph line spacing), `ResizableImage` (drag-resize images inside a page), plus CharacterCount, text alignment, font family, typography.
- Uploaded HEIC photos (the default from iPhones — this audience shoots on phones) are converted client-side via `heic2any` before upload.
- Export (`ExportBookModal`) renders the full book (`BookView`) and prints it with `react-to-print` under strict page dimensions — no server-side PDF pipeline, and the output matches the editor by construction.

**Dictation** (`useDictation` + `DictationOverlay`): MediaRecorder streams 250 ms audio chunks over a WebSocket to the backend proxy (Clerk token in the query string, since WS upgrades bypass HTTP auth middleware). Interim transcripts render as transient overlay text; finals are committed into the Tiptap document. Transient disconnects reconnect with exponential backoff (1 s → 10 s cap); fatal errors from the server (trial exhausted, auth) suppress reconnection and surface the message.

**AI revamp** (`GlobalAIToolbar`, `ToneSelector`): select text, pick a tone — the tone list adapts to the book's category — and the rewritten passage replaces the selection in place.

## API layer convention

Server state lives in `src/api/<domain>/` — one folder per backend resource, same shape everywhere:

```
src/api/books/
├── client.ts       # axios calls
├── types.ts        # request/response types
├── queryKeys.ts    # TanStack Query key factory
└── hooks/          # useBookData (queries) · useBookActions (mutations)
```

Domains: `books`, `chapters`, `pages`, `revamp`, `upload`. Components never call axios directly — they consume the hooks, and cache invalidation stays next to the mutations that require it.

## Environment

Copy `.env.example` → `.env`:

| Variable | Purpose |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk auth |
| `VITE_API_URL` | Backend REST base URL (e.g. `http://localhost:5000/api`) |
| `VITE_BACKEND_BASE_URL` | Backend origin, used to derive the WebSocket URL |
| `VITE_WS_URL` | Optional explicit override for the dictation WebSocket |

## Run

```bash
npm i
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
```
