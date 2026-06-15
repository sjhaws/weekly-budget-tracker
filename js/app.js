import { loadState, saveState, createExpense } from "./utils/storage.js";
import {
  getWeekBounds,
  formatWeekRange,
  todayString,
  parseDateString,
  toDateString,
} from "./utils/week.js";
import { calculateTotals, getProgressPercent, getProgressClass } from "./utils/totals.js";

const state = loadState();
let viewDate = new Date();

const els = {
  weekLabel: document.getElementById("week-label"),
  prevWeek: document.getElementById("prev-week"),
  nextWeek: document.getElementById("next-week"),
  trackedSpent: document.getElementById("tracked-spent"),
  weeklyLimitDisplay: document.getElementById("weekly-limit-display"),
  progressBar: document.getElementById("progress-bar"),
  progressFill: document.getElementById("progress-fill"),
  remainingText: document.getElementById("remaining-text"),
  percentText: document.getElementById("percent-text"),
  excludedSummary: document.getElementById("excluded-summary"),
  expenseForm: document.getElementById("expense-form"),
  amount: document.getElementById("amount"),
  description: document.getElementById("description"),
  date: document.getElementById("date"),
  excluded: document.getElementById("excluded"),
  expenseList: document.getElementById("expense-list"),
  expenseCount: document.getElementById("expense-count"),
  emptyState: document.getElementById("empty-state"),
  settingsBtn: document.getElementById("settings-btn"),
  settingsModal: document.getElementById("settings-modal"),
  settingsForm: document.getElementById("settings-form"),
  settingsCancel: document.getElementById("settings-cancel"),
  weeklyLimit: document.getElementById("weekly-limit"),
  weekStartsOn: document.getElementById("week-starts-on"),
  currency: document.getElementById("currency"),
};

function formatMoney(amount) {
  const { currency } = state.settings;
  return `${currency}${amount.toFixed(2)}`;
}

function getCurrentWeekBounds() {
  return getWeekBounds(viewDate, state.settings.weekStartsOn);
}

function persist() {
  saveState(state);
}

function renderSummary() {
  const { start, end } = getCurrentWeekBounds();
  const { weeklyLimit } = state.settings;
  const { tracked, excluded } = calculateTotals(state.expenses, start, end);

  const remaining = weeklyLimit - tracked;
  const overBudget = tracked > weeklyLimit;
  const percent = getProgressPercent(tracked, weeklyLimit);
  const progressClass = getProgressClass(percent, overBudget);

  els.weekLabel.textContent = formatWeekRange(start, end);
  els.trackedSpent.textContent = formatMoney(tracked);
  els.trackedSpent.classList.toggle("over-budget", overBudget);
  els.weeklyLimitDisplay.textContent = formatMoney(weeklyLimit);

  els.progressFill.style.width = `${percent}%`;
  els.progressFill.className = `progress-fill ${progressClass}`;
  els.progressBar.setAttribute("aria-valuenow", Math.round(percent));

  if (overBudget) {
    els.remainingText.textContent = `${formatMoney(Math.abs(remaining))} over budget`;
    els.remainingText.style.color = "var(--danger)";
  } else {
    els.remainingText.textContent = `${formatMoney(remaining)} remaining`;
    els.remainingText.style.color = "";
  }

  els.percentText.textContent = weeklyLimit > 0 ? `${Math.round((tracked / weeklyLimit) * 100)}%` : "—";

  if (excluded > 0) {
    els.excludedSummary.hidden = false;
    els.excludedSummary.textContent = `${formatMoney(excluded)} excluded from limit this week`;
  } else {
    els.excludedSummary.hidden = true;
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  els.nextWeek.disabled = end >= today;
}

function renderExpenseList() {
  const { start, end } = getCurrentWeekBounds();
  const { weekExpenses } = calculateTotals(state.expenses, start, end);

  els.expenseList.innerHTML = "";
  els.expenseCount.textContent = weekExpenses.length;
  els.emptyState.hidden = weekExpenses.length > 0;

  const sorted = [...weekExpenses].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    return dateCmp !== 0 ? dateCmp : b.id.localeCompare(a.id);
  });

  for (const expense of sorted) {
    els.expenseList.appendChild(createExpenseItem(expense));
  }
}

function createExpenseItem(expense) {
  const li = document.createElement("li");
  li.className = "expense-item";
  li.dataset.id = expense.id;

  const desc = document.createElement("span");
  desc.className = "expense-desc";
  desc.textContent = expense.description;

  const dateEl = document.createElement("span");
  dateEl.className = "expense-date";
  dateEl.textContent = formatExpenseDate(expense.date);

  const amount = document.createElement("span");
  amount.className = "expense-amount";
  amount.textContent = formatMoney(expense.amount);

  const actions = document.createElement("div");
  actions.className = "expense-actions";

  if (expense.excludedFromLimit) {
    const tag = document.createElement("span");
    tag.className = "expense-tag";
    tag.textContent = "Excluded";
    actions.appendChild(tag);
  }

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "btn-small";
  toggleBtn.textContent = expense.excludedFromLimit ? "Include in limit" : "Exclude from limit";
  toggleBtn.addEventListener("click", () => toggleExcluded(expense.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn-small danger";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteExpense(expense.id));

  actions.appendChild(toggleBtn);
  actions.appendChild(deleteBtn);

  li.append(desc, dateEl, amount, actions);
  return li;
}

function formatExpenseDate(dateStr) {
  const date = parseDateString(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function render() {
  renderSummary();
  renderExpenseList();
}

function addExpense(data) {
  const expense = createExpense(data);
  state.expenses.push(expense);
  persist();
  render();
}

function deleteExpense(id) {
  state.expenses = state.expenses.filter((e) => e.id !== id);
  persist();
  render();
}

function toggleExcluded(id) {
  const expense = state.expenses.find((e) => e.id === id);
  if (!expense) return;
  expense.excludedFromLimit = !expense.excludedFromLimit;
  persist();
  render();
}

function openSettings() {
  els.weeklyLimit.value = state.settings.weeklyLimit;
  els.weekStartsOn.value = String(state.settings.weekStartsOn);
  els.currency.value = state.settings.currency;
  els.settingsModal.showModal();
}

function saveSettings(event) {
  event.preventDefault();

  state.settings.weeklyLimit = Math.max(0, parseFloat(els.weeklyLimit.value) || 0);
  state.settings.weekStartsOn = parseInt(els.weekStartsOn.value, 10);
  state.settings.currency = els.currency.value.trim() || "$";

  persist();
  els.settingsModal.close();
  render();
}

function shiftWeek(offset) {
  const { start } = getCurrentWeekBounds();
  const next = new Date(start);
  next.setDate(start.getDate() + offset * 7);
  viewDate = next;
  els.date.value = clampDateToWeek(toDateString(viewDate));
  render();
}

function clampDateToWeek(dateStr) {
  const { start, end } = getCurrentWeekBounds();
  const date = parseDateString(dateStr);
  if (date < start) return toDateString(start);
  if (date > end) return toDateString(end);
  return dateStr;
}

els.expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = parseFloat(els.amount.value);
  if (!amount || amount <= 0) return;

  addExpense({
    amount,
    description: els.description.value,
    date: els.date.value,
    excludedFromLimit: els.excluded.checked,
  });

  els.expenseForm.reset();
  els.date.value = todayString();
  els.amount.focus();
});

els.settingsBtn.addEventListener("click", openSettings);
els.settingsForm.addEventListener("submit", saveSettings);
els.settingsCancel.addEventListener("click", () => els.settingsModal.close());

els.prevWeek.addEventListener("click", () => shiftWeek(-1));
els.nextWeek.addEventListener("click", () => shiftWeek(1));

els.date.value = todayString();
render();
