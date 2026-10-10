import test from "node:test";
import assert from "node:assert/strict";
import { Blockchain } from "../src/blockchain.js";
import { validateAccountName, validateAmount } from "../src/wallets.js";

test("genesis block exists and initial chain is valid", () => {
  const chain = new Blockchain({ difficulty: 1 });
  assert.equal(chain.getStats().height, 0);
  assert.equal(chain.getBlock(0).height, 0);
  assert.equal(chain.validateChain().valid, true);
});

test("account name validation rejects malformed names", () => {
  assert.equal(validateAccountName("alice"), "alice");
  assert.throws(() => validateAccountName("a"), /2-32 characters/);
  assert.throws(() => validateAccountName("alice space"), /2-32 characters/);
  assert.throws(() => validateAccountName(null), /must be a string/);
});

test("amount validation accepts cents and rejects invalid values", () => {
  assert.equal(validateAmount(2.5), 2.5);
  assert.throws(() => validateAmount(0), /positive number/);
  assert.throws(() => validateAmount(-1), /positive number/);
  assert.throws(() => validateAmount(1.234), /two decimal places/);
});

test("transaction is pending until a block is mined", () => {
  const chain = new Blockchain({ difficulty: 1 });
  const tx = chain.addTransaction({ from: "alice", to: "bob", amount: 12.25 });
  assert.equal(tx.status, "pending");
  assert.equal(chain.getStats().pendingTransactions, 1);
  assert.equal(chain.getStats().confirmedTransactions, 0);
});

test("mining confirms transactions, pays reward, and updates balances", () => {
  const chain = new Blockchain({ difficulty: 1, miningReward: 5 });
  const tx = chain.addTransaction({ from: "alice", to: "bob", amount: 10 });
  const block = chain.minePendingTransactions("miner");
  assert.equal(block.height, 1);
  assert.equal(block.transactions.some((item) => item.id === tx.id), true);
  assert.equal(chain.getStats().pendingTransactions, 0);
  assert.equal(chain.getStats().confirmedTransactions, 2); // transfer + reward
  assert.equal(chain.getBalances().alice, 90);
  assert.equal(chain.getBalances().bob, 60);
  assert.equal(chain.getBalances().miner, 5);
  assert.equal(chain.validateChain().valid, true);
});

test("prevents overspending across pending transactions", () => {
  const chain = new Blockchain({ difficulty: 1 });
  chain.addTransaction({ from: "alice", to: "bob", amount: 70 });
  assert.throws(() => chain.addTransaction({ from: "alice", to: "bob", amount: 40 }), /insufficient available balance/);
});

test("rejects self-transfers and reserved system sender", () => {
  const chain = new Blockchain({ difficulty: 1 });
  assert.throws(() => chain.addTransaction({ from: "alice", to: "alice", amount: 1 }), /different/);
  assert.throws(() => chain.addTransaction({ from: "system", to: "bob", amount: 1 }), /reserved/);
});

test("rejects mining when no transactions are pending", () => {
  const chain = new Blockchain({ difficulty: 1 });
  assert.throws(() => chain.minePendingTransactions(), /no pending transactions/);
});

test("lookup returns null for unknown blocks and transactions", () => {
  const chain = new Blockchain({ difficulty: 1 });
  assert.equal(chain.getBlock(99), null);
  assert.equal(chain.getTransaction("unknown"), null);
});

test("block previous-hash links are preserved after multiple blocks", () => {
  const chain = new Blockchain({ difficulty: 1 });
  chain.addTransaction({ from: "alice", to: "bob", amount: 1 });
  const first = chain.minePendingTransactions();
  chain.addTransaction({ from: "bob", to: "alice", amount: 1 });
  const second = chain.minePendingTransactions();
  assert.equal(second.previousHash, first.hash);
  assert.equal(chain.validateChain().valid, true);
});
