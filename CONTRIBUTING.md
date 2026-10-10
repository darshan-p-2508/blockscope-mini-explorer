# Contributing

Thanks for your interest in BlockScope.

## Before contributing

1. Read `README.md`, `docs/ARCHITECTURE.md`, and `docs/SECURITY.md`.
2. Open an issue for significant changes so scope and design can be discussed.
3. Do not submit real private keys, credentials, personal data, or secrets.

## Development process

1. Create a focused branch.
2. Make the smallest cohesive change.
3. Add or update tests.
4. Run `npm test` and `npm run check`.
5. Update relevant documentation and `PROGRESS.md`.
6. Submit a pull request describing the motivation, implementation, tests, and limitations.

## Commit style

Prefer clear, imperative messages, such as `test: cover invalid transaction amounts` or `docs: explain block validation`.

## Responsible disclosure

Do not publish exploitable details for a live public deployment before maintainers can investigate. This is an educational project, not a production financial system.
