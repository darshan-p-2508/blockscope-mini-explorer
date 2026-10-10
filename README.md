# BlockScope

**Explore the chain. Understand the data.**

BlockScope is an educational mini-blockchain and browser-based explorer built from scratch with Node.js and vanilla HTML, CSS, and JavaScript. It demonstrates how transactions are collected into hash-linked blocks, how a simple proof-of-work mining loop works, and how explorer interfaces query blockchain data.

> **Status:** Day 1 foundation · `v0.1.0` · local educational demo  
> **Network:** BlockScope Local Chain (simulated; not Ethereum or another public network)

## Why this project?

Blockchain records can be difficult to interpret. BlockScope makes core concepts inspectable through a dashboard, searchable blocks and transactions, a simple transaction form, and an explicit mining action. The project is designed to be understandable, testable, and extendable in daily stages.

## Day 1 features

- In-memory chain with a genesis block and SHA-256 block hashes.
- Previous-hash links and basic chain-integrity validation.
- Educational proof-of-work mining (adjustable difficulty in code).
- Transaction queue, mining rewards, and basic balance calculations.
- Explorer dashboard with chain statistics, recent blocks, recent transactions, and search.
- JSON HTTP API with request validation and safe error responses.
- Built-in Node.js test suite (`node --test`); no third-party runtime dependencies.
- Documentation for setup, architecture, API, testing, and limitations.

## Requirements

- Node.js 20 or newer
- Git
- VS Code (recommended)

No database, wallet provider, API key, or package installation is needed for the Day 1 baseline.

## Run locally

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/blockscope-mini-explorer.git
cd blockscope
node --version
npm test
npm run check
npm start
```

Open <http://127.0.0.1:3000> in your browser. If you downloaded the ZIP instead, extract it, open the `blockscope` folder in VS Code, and run the commands starting from `npm test`.

To use another port:

**PowerShell**
```powershell
$env:PORT=3001
npm start
```

**macOS/Linux**
```bash
PORT=3001 npm start
```

The server binds to `127.0.0.1` by default so the demo is local-only unless you deliberately configure a host.

## Quick tour

1. Open the dashboard.
2. Enter a sender, receiver, and positive amount, then add a transaction.
3. Mine the pending transactions into a block.
4. Search for the transaction ID or a block height.
5. Inspect the updated chain and balances.

The demo begins with a small amount of illustrative funds for `alice` and `bob`. These are simulated units, not real assets. State is stored in memory and resets when the server restarts.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Health and version |
| `GET` | `/api/chain` | Chain, blocks, and pending transactions |
| `GET` | `/api/stats` | Dashboard statistics |
| `GET` | `/api/blocks` | Block list |
| `GET` | `/api/blocks/:height` | Block by height |
| `GET` | `/api/transactions` | Confirmed and pending transactions |
| `GET` | `/api/transactions/:id` | Transaction by ID |
| `GET` | `/api/balances` | Simulated account balances |
| `POST` | `/api/transactions` | Add a transaction to the pending pool |
| `POST` | `/api/mine` | Mine pending transactions into a block |

See [`docs/API.md`](docs/API.md) for request and response examples.

## Project structure

```text
blockscope/
├── src/
│   ├── blockchain.js    # Chain, transactions, hashing, mining, validation
│   ├── wallets.js       # Day 1 account-name and amount validation helpers
│   └── server.js        # HTTP API and static-file server
├── public/
│   ├── index.html       # Explorer page
│   ├── styles.css       # Responsive interface
│   └── app.js           # API client and UI interactions
├── tests/
│   └── blockchain.test.js
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── TESTING.md
│   ├── USER_GUIDE.md
│   ├── DEVELOPER_GUIDE.md
│   ├── SECURITY.md
│   └── TEST_EVIDENCE.md
├── PROGRESS.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── package.json
```

## Roadmap

- **Day 1:** Core chain, local explorer, API, tests, foundational docs.
- **Day 2:** Ed25519 signatures, wallet lifecycle, stronger validation and security tests.
- **Day 3:** Multi-node propagation and synchronization.
- **Day 4:** Advanced explorer UX, improved search, accessibility and responsive polish.
- **Day 5:** Full regression testing, deployment and release documentation.
- **Day 6:** Public launch, tagged release and project announcement.

## Important limitations

BlockScope Day 1 is a learning project, not a production cryptocurrency. It does not connect to Ethereum or another public blockchain. It has no consensus between independent nodes, persistent storage, real token value, production wallet security, or protection against every economic attack. The current account labels are not cryptographic identities; digital signatures are planned for Day 2. Never use real funds or real secrets with this demo.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Contributions should include tests and documentation updates where appropriate.

## License

MIT. See [`LICENSE`](LICENSE).
