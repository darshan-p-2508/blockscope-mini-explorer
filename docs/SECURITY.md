# Security Notes

## Scope

BlockScope Day 1 is an educational local demo. It is not designed to secure value or hostile internet traffic.

## Current safeguards

- Server binds to loopback (`127.0.0.1`) by default.
- JSON request body limit of 16 KB.
- Input validation for account labels and amounts.
- Static-file path resolution checks.
- JSON responses set `X-Content-Type-Options: nosniff`.
- Static assets use a restrictive Content Security Policy.
- No third-party dependencies or API keys are required in this stage.

## Known limitations

- Account names are not cryptographic identities; there are no transaction signatures in Day 1.
- Balances and chain state are in memory and reset on restart.
- No persistence, multi-node consensus, rate limiting, authentication, or abuse monitoring.
- Proof of work is a demonstration only and should not be considered resistant to attacks.
- The server's in-memory state is authoritative; this is not a decentralized network.
- This version has not undergone a professional security audit.

## Before any public deployment

Keep private configuration out of Git, use a production host with HTTPS and request controls, consider rate limits and resource caps, review all API behavior, and test from a clean environment. Do not expose a development instance directly to the public internet. Day 5 includes a deployment/security review, but it does not replace an independent audit.
