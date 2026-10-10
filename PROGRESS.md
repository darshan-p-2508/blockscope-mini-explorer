# BlockScope Development Progress

## Day 1 — 2026-10-10 — Foundation

### Scope
Create a fresh, runnable baseline with a mini blockchain core, local explorer, JSON API, automated tests, and foundational documentation.

### Implemented in this Day 1 package
- In-memory chain with genesis block, SHA-256 block hashing, previous-hash links, and proof-of-work.
- Pending transactions, simulated balances, reward transactions, and validation checks.
- Node.js HTTP server and JSON API with request-size limits and input validation.
- Browser dashboard with stats, account balances, transaction submission, mining, search, and detail dialogs.
- Built-in automated tests and syntax-check script.
- README, user guide, developer guide, architecture, API reference, testing guide, security notes, and evidence template.

### Verification status
The repository includes automated tests and manual smoke-test instructions. Run `npm test`, `npm run check`, and the documented API/browser checks locally, then update `docs/TEST_EVIDENCE.md` with actual results. Do not mark checks as passed before running them.

### Known limitations
- Day 1 uses demo account labels, not cryptographic wallets.
- No persistent storage or multi-node network yet.
- No public-chain integration.
- Local-only default binding.

### Next day
Add Ed25519 identities/signatures, signature verification, stronger transaction authorization, and additional negative tests.
