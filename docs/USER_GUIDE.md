# BlockScope User Guide

## 1. Start the application

Install Node.js 20+, open the project folder in VS Code, and run:

```bash
npm test
npm run check
npm start
```

Visit `http://127.0.0.1:3000`.

## 2. Read the dashboard

- **Latest height:** height of the newest block. The genesis block is height 0.
- **Confirmed TXs:** transactions included in mined blocks, including mining reward transactions.
- **Pending TXs:** transfers waiting in the transaction pool.
- **Chain integrity:** result of recalculating block hashes and checking previous-hash links and proof-of-work.

## 3. Add a transaction

Enter a sender and receiver account name and an amount. Demo accounts `alice` and `bob` start with illustrative balances. Valid account names are 2–32 letters, digits, underscores, or hyphens. Amounts must be positive and have at most two decimal places.

A successful submission creates a pending transaction. It is not confirmed until a block is mined.

## 4. Mine pending transactions

Enter a miner account name and select **Mine pending**. The application validates queued outgoing amounts, adds the configured demo mining reward, searches for a valid proof-of-work nonce, and creates a new block.

## 5. Search and inspect

Search a numeric block height such as `0` or `1`, or paste a transaction ID shown in the transaction table. Click block heights and transaction IDs to inspect their full JSON details.

## 6. Troubleshooting

- **Page does not load:** check the terminal for startup errors and verify the URL/port.
- **Port is already in use:** set `PORT` to another value before starting.
- **Insufficient balance:** reduce the amount or use an account with sufficient simulated balance.
- **No pending transactions:** add a transfer before mining.
- **Search not found:** check the block height or use the complete transaction ID.
- **Data disappeared:** this stage uses memory only; restarting the server resets the chain.

## Safety

This is a local educational simulation. The account labels do not represent real wallets and BSC is only a demo unit label. Do not use it for real money, production services, or sensitive information.
