# Privacy Model

Local Subscription Radar is designed as a local-first receipt and subscription organizer.

## v0.1 Guarantees

- No bank login.
- No Gmail import.
- No receipt image upload.
- No marketplace scraping.
- No AI API call.
- No backend server.
- No telemetry.

The pasted text is analyzed by deterministic TypeScript code in the browser. The app only stores what the browser runtime already holds in memory. Future persistence must be opt-in and documented before release.

## Sensitive Data Guidance

Users should prefer sample data or redacted text for public feedback. Do not paste full card numbers, legal identifiers, private addresses, or authentication tokens.

## Product Boundary

This tool is an organizer and detection aid. It may highlight likely recurring charges, renewal clues, or refund windows, but it does not provide financial, legal, tax, or cancellation advice.

## Future Features That Require New Review

- CSV upload.
- OCR.
- Browser extension.
- Cloud sync.
- Email import.
- Bank or card aggregation.
- Hosted user accounts.

Each future feature must keep the no-upload default or document a separate privacy mode and AO/human gate.
