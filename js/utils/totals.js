import { isDateInWeek } from "./week.js";

export function getWeekExpenses(expenses, weekStart, weekEnd) {
  return expenses.filter((e) => isDateInWeek(e.date, weekStart, weekEnd));
}

export function calculateTotals(expenses, weekStart, weekEnd) {
  const weekExpenses = getWeekExpenses(expenses, weekStart, weekEnd);

  let tracked = 0;
  let excluded = 0;

  for (const expense of weekExpenses) {
    if (expense.excludedFromLimit) {
      excluded += expense.amount;
    } else {
      tracked += expense.amount;
    }
  }

  return { tracked, excluded, weekExpenses };
}

export function getProgressPercent(tracked, limit) {
  if (limit <= 0) return tracked > 0 ? 100 : 0;
  return Math.min((tracked / limit) * 100, 100);
}

export function getProgressClass(percent, overBudget) {
  if (overBudget) return "danger";
  if (percent >= 90) return "danger";
  if (percent >= 75) return "warning";
  return "";
}
