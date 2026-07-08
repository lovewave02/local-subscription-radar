# Demo Script

## Goal

Show that a normal user can try the app in under two minutes without an account, bank connection, upload, or private receipt.

## Steps

1. Run the app locally.

```bash
npm install
npm run dev
```

2. Open `http://localhost:5173`.
3. Click `Streaming bundle`.
4. Confirm that `Detected recurring charges` includes monthly and annual items.
5. Click `Trial + app store`.
6. Confirm that `Trial/refund/deadline clues` includes trial and cancellation clues.
7. Click `Shopping + refund window`.
8. Confirm that a refund clue and weekly billing candidate appear.
9. Click `Copy Markdown` and paste it into a local note.
10. Click `Leave feedback` only after the public repo exists.

## Acceptance

- The app does not ask for account credentials.
- The app does not need a backend.
- The sample data is not personal.
- The result avoids "cancel this" or guaranteed savings language.
- The feedback path asks for detection quality, not private financial disclosure.
