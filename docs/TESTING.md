# Testing Guide

## Automated checks

Run:

```bash
npm test
npm run check
```

The suite uses Node.js's built-in `node:test` and `node:assert` modules, so no test framework installation is needed.

## Current coverage

- Genesis block and initial chain validity.
- Account-name validation.
- Amount validation and decimal precision.
- Pending transaction lifecycle.
- Mining, reward credit, balance updates, and chain validity.
- Overspending protection for pending transactions.
- Self-transfer and reserved system-sender rejection.
- Mining with an empty pool.
- Unknown block/transaction lookup.
- Previous-hash links across multiple blocks.

## Manual smoke test

1. Start the app with `npm start`.
2. Open `http://127.0.0.1:3000`.
3. Check that the dashboard shows a valid chain.
4. Add `alice -> bob`, amount `2.50`.
5. Confirm pending count increases.
6. Mine using `miner`.
7. Confirm block height increments, pending count returns to zero, and chain integrity remains valid.
8. Search for the new transaction ID and open the new block.
9. Run `curl http://127.0.0.1:3000/api/validate`.

## Evidence policy

Do not claim checks passed unless they were executed. Record the date, environment, command, exit code, and summary in `TEST_EVIDENCE.md`. Screenshots should show the actual running application and should not be fabricated.
