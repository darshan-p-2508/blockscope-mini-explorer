# API Reference

Base URL: `http://127.0.0.1:3000`. All API responses are JSON. Error responses use `{ "error": "message" }`.

## `GET /api/health`

Returns application name, version, uptime, and `ok`.

## `GET /api/stats`

Returns chain height, block count, confirmed/pending transaction counts, mining difficulty/reward, latest block hash, account count, and network label.

## `GET /api/chain`

Returns the full chain, pending transactions, balances, stats, and validation result. Intended for this small local demo; a production API would paginate large results.

## `GET /api/blocks`

Returns blocks in newest-first order.

## `GET /api/blocks/:height`

Returns one block by non-negative integer height. Example: `GET /api/blocks/0`.

## `GET /api/transactions`

Returns confirmed and pending transactions with `status` and `blockHeight` metadata.

## `GET /api/transactions/:id`

Returns a transaction by ID, or 404 if not found.

## `GET /api/balances`

Returns the current simulated balances as an object keyed by account name.

## `GET /api/validate`

Returns `{ "valid": true, "blockCount": 1 }` on a valid chain. Invalid-chain results include the relevant height and reason.

## `POST /api/transactions`

Example body:

```json
{
  "from": "alice",
  "to": "bob",
  "amount": 2.5
}
```

Successful response: HTTP 201 with the created pending transaction and a message. The amount must be positive, have at most two decimal places, and fit the demo limit. Sender and receiver must differ. The sender must have enough available simulated balance.

## `POST /api/mine`

Example body:

```json
{ "miner": "miner" }
```

Successful response: HTTP 201 with the mined block and chain-validation result. Returns HTTP 400 when there are no pending transactions or the request is invalid.

## Quick curl checks

```bash
curl http://127.0.0.1:3000/api/health
curl http://127.0.0.1:3000/api/stats
curl -X POST http://127.0.0.1:3000/api/transactions -H "Content-Type: application/json" -d "{\"from\":\"alice\",\"to\":\"bob\",\"amount\":2.5}"
curl -X POST http://127.0.0.1:3000/api/mine -H "Content-Type: application/json" -d "{\"miner\":\"miner\"}"
curl http://127.0.0.1:3000/api/validate
```
