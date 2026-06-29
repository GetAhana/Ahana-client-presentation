# Ahana Client Presentation

Digital Success Consultation deck for Ahana reps — customer-facing slides plus rep control surface.

## Main file

Open **`index.html`** in a browser, or host it on Cloudflare Pages / Workers / Netlify (root URL works with no path).

| URL param | Purpose |
|-----------|---------|
| `?d=<base64url(JSON)>` | Load client data (from Make + Gemini) |
| `?present=1` | Skip control view; go straight to slides |
| `?present=1&d=…` | Pre-filled customer presentation |

## Docs

- [`docs/ahana-consultation-data-contract.md`](docs/ahana-consultation-data-contract.md) — JSON schema, webhook v2, Make flow
- [`docs/ahana-consultation-gemini-prompts.md`](docs/ahana-consultation-gemini-prompts.md) — Gemini enrichment prompts
- [`docs/ahana-consultation-plan-logic.md`](docs/ahana-consultation-plan-logic.md) — Starter / Enhanced / Premium rules

## Legacy

Earlier split-file version (`legacy/`) — superseded by `index.html`.
