# landing-page — marketing site

Part of [RememberPress](../README.md) · see also: [backend](../backend/README.md) · [frontend](../frontend/README.md)

Next.js 15 site for [rememberpress.com](https://rememberpress.com/): hero, offerings (memoir / yearbook / business book), how-it-works, founder story videos, pricing, and a QR section for print collateral. Deployed on Vercel.

## Structure

- One page, composed of section components in `src/components/landing/` — `Hero`, `Features`, `HowItWorks`, `Stories`, `Testimonials`, `Pricing`, `QRSection`, `Philosophy`, `Footer`.
- **All copy and pricing live in `src/data/content.ts`** — the sections are presentation-only, so the founder's copy edits never touch component code.
- shadcn/ui primitives in `src/components/ui/`, Tailwind v4.
- Every CTA deep-links into the app at [app.rememberpress.com](https://app.rememberpress.com/).

## Run

```bash
npm i
npm run dev        # http://localhost:3000
```
