# Local Receipt / Subscription Radar

No bank login, no upload, paste text locally to spot recurring charges and renewal risks.

Local Subscription Radar is a browser-only PWA for reviewing receipt or subscription email text before quiet renewals turn into monthly leakage. It is intentionally deterministic and local-first: the v0.1 MVP does not use bank linking, Gmail import, OCR, scraping, or AI APIs.

## What It Does

- Paste redacted receipt or subscription text.
- Load safe sample data when you do not want to use personal text.
- Detect likely recurring charges and estimate monthly equivalents.
- Surface trial, refund, cancellation, and renewal clues.
- Mark ambiguous amount lines as `Needs review`.
- Copy Markdown or CSV for your own records.

This is an organizer and detection aid, not financial advice.

## Quick Demo

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, click a sample button, and review the detected recurring charges.

Expected checkpoints:

1. A sample loads without requesting an account or network service.
2. The monthly leakage estimate updates.
3. `Detected recurring charges` lists monthly/yearly/weekly candidates.
4. `Trial/refund/deadline clues` shows cancellation, refund, or renewal hints.
5. `Copy Markdown` and `Copy CSV` export the current local analysis.

## Verification

```bash
npm test
npm run build
```

## Public Deployment

The Vite build is configured with `base: "/local-subscription-radar/"` so the
static bundle can be served from GitHub Pages at:

`https://lovewave02.github.io/local-subscription-radar/`

## Privacy Model

The MVP runs in the browser and has no server component. See [`docs/PRIVACY_MODEL.md`](docs/PRIVACY_MODEL.md).

## Feedback

The first adoption goal is one public non-owner feedback signal. If you try the sample data or redacted text, open a usage-feedback issue with:

- what you pasted or which sample you used,
- what the app detected correctly,
- what it missed or made confusing.

Usage feedback template: `.github/ISSUE_TEMPLATE/usage_feedback.yml`
