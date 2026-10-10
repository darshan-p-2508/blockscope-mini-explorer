const $ = (selector) => document.querySelector(selector);
const money = (value) => `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} BSC`;
const shortHash = (value) => value ? `${value.slice(0, 12)}…${value.slice(-8)}` : "—";
const formatTime = (value) => value ? new Date(value).toLocaleString() : "—";

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
function setMessage(selector, message, isError = false) {
  const node = $(selector);
  node.textContent = message;
  node.classList.toggle("error", isError);
}
function showDetail(title, data) {
  $("#dialog-title").textContent = title;
  $("#dialog-content").textContent = JSON.stringify(data, null, 2);
  const dialog = $("#detail-dialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else alert(`${title}\n\n${JSON.stringify(data, null, 2)}`);
}
function renderBalances(balances) {
  const entries = Object.entries(balances);
  $("#balances").innerHTML = entries.length ? entries.map(([name, amount]) => `
    <div class="balance-row">
      <div class="account"><span class="avatar">${escapeHtml(name.slice(0, 1).toUpperCase())}</span>${escapeHtml(name)}</div>
      <div class="amount">${money(amount)}</div>
    </div>`).join("") : '<p class="muted">No accounts yet.</p>';
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function renderBlocks(blocks) {
  $("#blocks-body").innerHTML = blocks.length ? blocks.slice(0, 8).map((block) => `
    <tr>
      <td><button class="clickable" data-block="${block.height}">#${block.height}</button></td>
      <td class="hash" title="${block.hash}">${shortHash(block.hash)}</td>
      <td class="hash" title="${block.previousHash}">${shortHash(block.previousHash)}</td>
      <td>${block.transactions.length}</td><td>${escapeHtml(formatTime(block.timestamp))}</td>
    </tr>`).join("") : '<tr><td colspan="5" class="empty">No blocks yet.</td></tr>';
}
function renderTransactions(transactions) {
  $("#transactions-body").innerHTML = transactions.length ? transactions.slice(0, 10).map((tx) => `
    <tr>
      <td><button class="clickable hash" data-tx="${escapeHtml(tx.id)}" title="${escapeHtml(tx.id)}">${shortHash(tx.id)}</button></td>
      <td>${escapeHtml(tx.from)}</td><td>${escapeHtml(tx.to)}</td><td>${money(tx.amount)}</td>
      <td><span class="badge ${tx.status}">${tx.status}</span></td>
    </tr>`).join("") : '<tr><td colspan="5" class="empty">No transactions yet. Add one above.</td></tr>';
}
async function refresh() {
  try {
    const [stats, chain, balances, transactions, health] = await Promise.all([
      api("/api/stats"), api("/api/chain"), api("/api/balances"),
      api("/api/transactions"), api("/api/health")
    ]);
    $("#height").textContent = stats.height.toLocaleString();
    $("#confirmed").textContent = stats.confirmedTransactions.toLocaleString();
    $("#pending").textContent = stats.pendingTransactions.toLocaleString();
    const valid = chain.validation.valid;
    $("#integrity").textContent = valid ? "Valid" : "Invalid";
    $("#integrity").style.color = valid ? "var(--green)" : "var(--red)";
    $("#integrity-foot").textContent = valid ? `${chain.validation.blockCount} blocks verified` : chain.validation.reason;
    renderBalances(balances.balances);
    renderBlocks(chain.chain.slice().reverse());
    renderTransactions(transactions.transactions);
    $("#server-status").innerHTML = '<span class="pulse"></span> API connected';
    $("#version").textContent = `v${health.version}`;
  } catch (error) {
    $("#server-status").textContent = "API unavailable";
    setMessage("#search-message", `Could not load explorer data: ${error.message}`, true);
  }
}

$("#transaction-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = { from: form.get("from"), to: form.get("to"), amount: Number(form.get("amount")) };
  try {
    const result = await api("/api/transactions", { method: "POST", body: JSON.stringify(payload) });
    setMessage("#transaction-message", `Added pending transaction ${result.transaction.id}`);
    await refresh();
  } catch (error) { setMessage("#transaction-message", error.message, true); }
});
$("#mine-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const miner = $("#miner").value;
  try {
    const result = await api("/api/mine", { method: "POST", body: JSON.stringify({ miner }) });
    setMessage("#mine-message", `Block #${result.block.height} mined · ${result.block.hash.slice(0, 16)}… · chain ${result.validation.valid ? "valid" : "invalid"}`);
    await refresh();
  } catch (error) { setMessage("#mine-message", error.message, true); }
});
$("#refresh-button").addEventListener("click", refresh);
$("#search-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = $("#search-input").value.trim();
  if (!query) return setMessage("#search-message", "Enter a block height or transaction ID.", true);
  try {
    if (/^\d+$/.test(query)) {
      const result = await api(`/api/blocks/${query}`);
      showDetail(`Block #${query}`, result.block);
      setMessage("#search-message", `Found block #${query}.`);
    } else {
      const result = await api(`/api/transactions/${encodeURIComponent(query)}`);
      showDetail("Transaction details", result.transaction);
      setMessage("#search-message", `Found transaction ${shortHash(result.transaction.id)}.`);
    }
  } catch (error) { setMessage("#search-message", error.message, true); }
});
document.addEventListener("click", async (event) => {
  const blockButton = event.target.closest("[data-block]");
  const txButton = event.target.closest("[data-tx]");
  try {
    if (blockButton) {
      const { block } = await api(`/api/blocks/${blockButton.dataset.block}`);
      showDetail(`Block #${block.height}`, block);
    } else if (txButton) {
      const { transaction } = await api(`/api/transactions/${encodeURIComponent(txButton.dataset.tx)}`);
      showDetail("Transaction details", transaction);
    }
  } catch (error) { setMessage("#search-message", error.message, true); }
});
$("#dialog-close").addEventListener("click", () => $("#detail-dialog").close());
$("#detail-dialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
refresh();
