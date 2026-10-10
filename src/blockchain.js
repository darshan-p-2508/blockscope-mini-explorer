import { createHash, randomUUID } from "node:crypto";
import { validateAccountName, validateAmount } from "./wallets.js";

const sha256 = (input) => createHash("sha256").update(input).digest("hex");

export class Blockchain {
  constructor({ difficulty = 3, miningReward = 5 } = {}) {
    if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
      throw new Error("difficulty must be an integer between 1 and 5");
    }
    this.difficulty = difficulty;
    this.miningReward = validateAmount(miningReward);
    this.pendingTransactions = [];
    this.chain = [this.#createGenesisBlock()];
    this.balances = new Map([["alice", 100], ["bob", 50], ["miner", 0]]);
  }

  #createGenesisBlock() {
    const block = {
      height: 0,
      timestamp: new Date().toISOString(),
      transactions: [],
      previousHash: "0".repeat(64),
      nonce: 0,
      hash: ""
    };
    block.hash = this.#calculateHash(block);
    return block;
  }

  #calculateHash(block) {
    const payload = JSON.stringify({
      height: block.height,
      timestamp: block.timestamp,
      transactions: block.transactions,
      previousHash: block.previousHash,
      nonce: block.nonce
    });
    return sha256(payload);
  }

  getLatestBlock() {
    return structuredClone(this.chain[this.chain.length - 1]);
  }

  getBlocks() {
    return structuredClone([...this.chain].reverse());
  }

  getBlock(height) {
    if (!Number.isInteger(height) || height < 0) return null;
    const block = this.chain[height];
    return block ? structuredClone(block) : null;
  }

  getTransactions() {
    const confirmed = this.chain.slice(1).flatMap((block) =>
      block.transactions.map((tx) => ({ ...tx, blockHeight: block.height, status: "confirmed" }))
    );
    const pending = this.pendingTransactions.map((tx) => ({ ...tx, blockHeight: null, status: "pending" }));
    return [...pending.reverse(), ...confirmed.reverse()];
  }

  getTransaction(id) {
    return this.getTransactions().find((tx) => tx.id === id) ?? null;
  }

  getBalances() {
    return Object.fromEntries([...this.balances.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }

  getStats() {
    const confirmedTransactions = this.chain.slice(1).reduce((n, b) => n + b.transactions.length, 0);
    return {
      height: this.chain.length - 1,
      blockCount: this.chain.length,
      confirmedTransactions,
      pendingTransactions: this.pendingTransactions.length,
      difficulty: this.difficulty,
      miningReward: this.miningReward,
      latestBlockHash: this.getLatestBlock().hash,
      accounts: this.balances.size,
      network: "BlockScope Local Chain"
    };
  }

  addTransaction({ from, to, amount }) {
    const sender = validateAccountName(from, "from");
    const receiver = validateAccountName(to, "to");
    const value = validateAmount(amount);
    if (sender === receiver) throw new Error("sender and receiver must be different");
    if (sender.toLowerCase() === "system") throw new Error("'system' is reserved");
    const available = this.#availableBalance(sender);
    if (available < value) {
      throw new Error(`insufficient available balance for ${sender} (available: ${available})`);
    }

    const tx = {
      id: randomUUID(),
      from: sender,
      to: receiver,
      amount: value,
      timestamp: new Date().toISOString()
    };
    this.pendingTransactions.push(tx);
    // Reserve pending outgoing amounts to prevent overspending before mining.
    this.balances.set(sender, this.balances.get(sender) ?? 0);
    this.balances.set(receiver, this.balances.get(receiver) ?? 0);
    return { ...tx, status: "pending", blockHeight: null };
  }

  #availableBalance(account) {
    const confirmed = this.balances.get(account) ?? 0;
    const reserved = this.pendingTransactions
      .filter((tx) => tx.from === account)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return Number((confirmed - reserved).toFixed(2));
  }

  minePendingTransactions(miner = "miner") {
    const minerName = validateAccountName(miner, "miner");
    if (this.pendingTransactions.length === 0) {
      throw new Error("no pending transactions to mine");
    }

    // Recheck balances in sequence before committing a block.
    const working = new Map(this.balances);
    for (const tx of this.pendingTransactions) {
      const current = working.get(tx.from) ?? 0;
      if (current < tx.amount) throw new Error(`insufficient balance while mining transaction ${tx.id}`);
      working.set(tx.from, Number((current - tx.amount).toFixed(2)));
      working.set(tx.to, Number(((working.get(tx.to) ?? 0) + tx.amount).toFixed(2)));
    }
    working.set(minerName, Number(((working.get(minerName) ?? 0) + this.miningReward).toFixed(2)));

    const rewardTx = {
      id: randomUUID(),
      from: "system",
      to: minerName,
      amount: this.miningReward,
      timestamp: new Date().toISOString(),
      type: "mining-reward"
    };
    const transactions = [...this.pendingTransactions, rewardTx];
    const latest = this.getLatestBlock();
    const block = {
      height: this.chain.length,
      timestamp: new Date().toISOString(),
      transactions,
      previousHash: latest.hash,
      nonce: 0,
      hash: ""
    };

    const target = "0".repeat(this.difficulty);
    do {
      block.hash = this.#calculateHash(block);
      if (block.hash.startsWith(target)) break;
      block.nonce += 1;
    } while (true);

    this.chain.push(block);
    this.pendingTransactions = [];
    this.balances = working;
    return structuredClone(block);
  }

  validateChain() {
    for (let i = 0; i < this.chain.length; i += 1) {
      const block = this.chain[i];
      if (block.height !== i) return { valid: false, blockHeight: i, reason: "block height mismatch" };
      if (this.#calculateHash(block) !== block.hash) {
        return { valid: false, blockHeight: i, reason: "block hash mismatch" };
      }
      if (i > 0 && block.previousHash !== this.chain[i - 1].hash) {
        return { valid: false, blockHeight: i, reason: "previous hash mismatch" };
      }
      if (i > 0 && !block.hash.startsWith("0".repeat(this.difficulty))) {
        return { valid: false, blockHeight: i, reason: "proof-of-work requirement not met" };
      }
    }
    return { valid: true, blockCount: this.chain.length };
  }

  exportChain() {
    return {
      chain: structuredClone(this.chain),
      pendingTransactions: structuredClone(this.pendingTransactions),
      stats: this.getStats(),
      balances: this.getBalances(),
      validation: this.validateChain()
    };
  }
}
