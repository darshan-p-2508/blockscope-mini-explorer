# Test Evidence Log

## Day 1 package verification

These checks were executed against the generated Day 1 project in the build environment on 2026-10-10. Re-run them on your own machine after extracting the ZIP; environment differences can still occur.

- Node.js: `v22.16.0`
- Automated tests: `npm test` — **PASS, 10 tests passed, 0 failed**
- Syntax checks: `npm run check` — **PASS, exit code 0**
- HTTP smoke test: **PASS** — `GET /api/health` returned `ok: true`
- Transaction flow: **PASS** — posted a transfer from `alice` to `bob`; API returned a pending transaction.
- Mining flow: **PASS** — mined the pending transfer and reward into block height 1.
- Integrity check: **PASS** — `GET /api/validate` returned `valid: true` with 2 blocks.

The integration smoke test used a temporary local port and a fresh in-memory chain. The transaction ID and timestamps vary between runs.

## Reproduce locally

Run these from the project root:

```bash
node --version
npm test
npm run check
npm start
```

In a second terminal, test the API:

```bash
curl http://127.0.0.1:3000/api/health
curl -X POST http://127.0.0.1:3000/api/transactions -H "Content-Type: application/json" -d "{\"from\":\"alice\",\"to\":\"bob\",\"amount\":2.5}"
curl -X POST http://127.0.0.1:3000/api/mine -H "Content-Type: application/json" -d "{\"miner\":\"miner\"}"
curl http://127.0.0.1:3000/api/validate
```

## Screenshot checklist

Capture real screenshots after running the app:
1. Dashboard with valid chain.
2. Pending transaction before mining.
3. Newly mined block and updated balances.
4. Transaction detail dialog.
5. Test terminal showing actual test results.

Store screenshots under `docs/assets/` and reference them from README. Do not fabricate screenshots or test output.
