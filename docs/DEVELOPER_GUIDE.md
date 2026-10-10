# Developer Guide

## Prerequisites

- Node.js 20 or newer
- Git
- VS Code or another editor

There are no external runtime dependencies in Day 1.

## Commands

```bash
npm start       # start server
npm run dev     # restart server when source files change
npm test        # execute built-in Node test suite
npm run check   # syntax-check the server/core modules
```

## Where to change code

- `src/blockchain.js`: chain state, transaction queue, mining, balances, hash and integrity checks.
- `src/wallets.js`: account-name and amount validation helpers. This is where Day 2 wallet/signature work can begin.
- `src/server.js`: HTTP routes, JSON parsing, static files, and error responses.
- `public/index.html`: page structure.
- `public/styles.css`: design system and responsive layout.
- `public/app.js`: fetch calls, rendering, forms, search, and detail dialog.
- `tests/blockchain.test.js`: automated unit tests.

## Development workflow

1. Create a branch for a cohesive feature or fix.
2. Write or update tests before/alongside implementation.
3. Run `npm test` and `npm run check`.
4. Start the app and manually verify the affected browser/API flow.
5. Update docs and `PROGRESS.md`.
6. Commit with a message describing the actual change.

## Coding conventions

Use ESM imports, explicit validation, clear errors, small functions, semantic HTML, and accessible form labels. Do not add dependencies without documenting why. Keep secrets out of the repository.

## Planned stages

Day 2: Ed25519 identity/signature verification and stricter transaction rules. Day 3: peer protocol and synchronization. Day 4: richer explorer UI and usability. Day 5: regression/security/deployment readiness. Day 6: public release.
