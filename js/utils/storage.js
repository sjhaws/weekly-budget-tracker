const STORAGE_KEY = "weekly-budget-tracker";

const DEFAULT_STATE = {
  settings: {
    weeklyLimit: 500,
    weekStartsOn: 1,
    currency: "$",
  },
  expenses: [],
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);

    const parsed = JSON.parse(raw);
    return {
      settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createExpense({ amount, description, date, excludedFromLimit }) {
  return {
    id: crypto.randomUUID(),
    amount: Math.round(amount * 100) / 100,
    description: description.trim(),
    date,
    excludedFromLimit: Boolean(excludedFromLimit),
  };
}
