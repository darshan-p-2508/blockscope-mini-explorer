# Architecture

## Day 1 architecture

BlockScope is a single-process, in-memory educational application with no external runtime dependencies.

```text
Browser (public/)
    │ HTTP + JSON
    ▼
Node.js HTTP server (src/server.js)
    ├── Static assets (public/index.html, styles.css, app.js)
    └── API routes
          │
          ▼
      Blockchain (src/blockchain.js)
          ├── Pending transaction pool
          ├── SHA-256 block hashing
          ├── Proof-of-work nonce loop
          ├── Previous-hash links
          ├── Chain validation
          └── In-memory demo balances
```

## Transaction lifecycle

1. Browser submits sender, receiver, and amount to `POST /api/transactions`.
2. The server validates the JSON body and passes it to `Blockchain.addTransaction`.
3. Account labels and amount are validated; the sender's available balance accounts for pending outgoing transactions.
4. A unique transaction ID and timestamp are assigned and the transaction enters the pending pool.
5. `POST /api/mine` rechecks the pending transactions against a working balance map.
6. A reward transaction is added, then the server searches for a nonce whose SHA-256 hash begins with the configured number of zeroes.
7. The block links to the previous block hash, is appended to the chain, and the computed balances are committed.
8. The UI reloads statistics, blocks, transactions, balances, and chain validation.

## Hash calculation

A block hash is SHA-256 over a JSON serialization of its height, timestamp, transactions, previous hash, and nonce. The genesis block uses a string of 64 zeroes as its previous hash. Every non-genesis block must link to the preceding block and satisfy the proof-of-work prefix.

## Trust boundaries and design limits

- The server is the single source of truth in this stage.
- The chain and balances live in process memory.
- Account names are demo labels, not cryptographic wallet addresses.
- The proof-of-work mechanism is illustrative and is not a secure consensus protocol.
- Day 2 will add cryptographic signatures and more rigorous validation; Day 3 will address independent nodes and synchronization.
