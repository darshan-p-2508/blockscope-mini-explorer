/**
 * Day 1 validation helpers. Cryptographic wallet identities/signatures are a
 * planned Day 2 milestone; these labels are demo account names, not wallets.
 */
export function validateAccountName(value, fieldName = "account") {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  const name = value.trim();
  if (!/^[a-zA-Z0-9_-]{2,32}$/.test(name)) {
    throw new Error(`${fieldName} must be 2-32 characters using letters, numbers, "_" or "-"`);
  }
  return name;
}

export function validateAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(Math.round(amount * 100))) {
    throw new Error("amount must be a positive number with at most two decimal places");
  }
  if (Math.round(amount * 100) !== amount * 100) {
    throw new Error("amount must have at most two decimal places");
  }
  if (amount > 1_000_000_000) {
    throw new Error("amount exceeds the demo limit");
  }
  return Number(amount.toFixed(2));
}
