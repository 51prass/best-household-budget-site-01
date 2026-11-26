// Hearth — state and derived totals.
// One job: keep the single source of truth (the transaction list) and
// compute every figure the site shows from it. Nothing is hardcoded.

import { BILLS, CURRENT_MONTH, DEMO_TODAY, EXPENSE_CATEGORIES, MONTHLY_HISTORY, freshState, loadState, saveState } from './data.js';

export const state = loadState();

export function persist() {
  saveState(state);
}

export function resetDemoData() {
  const seed = freshState();
  state.transactions = seed.transactions;
  state.budgets = seed.budgets;
  state.goals = seed.goals;
  persist();
}

export function monthOf(date) {
  return date.slice(0, 7);
}

export function transactionsIn(month) {
  return state.transactions.filter((t) => monthOf(t.date) === month);
}

export function monthTotals(month) {
  const rows = transactionsIn(month);
  let income = 0;
  let spent = 0;
  for (const t of rows) {
    if (t.type === 'income') income += t.amount;
    else spent += t.amount;
  }
  return { income, spent, left: income - spent, savingsRate: income > 0 ? (income - spent) / income : 0, count: rows.length };
}

export function currentTotals() {
  return monthTotals(CURRENT_MONTH);
}

export function spendingByCategory(month) {
  const totals = {};
  for (const c of EXPENSE_CATEGORIES) totals[c] = 0;
  for (const t of transactionsIn(month)) {
    if (t.type === 'expense' && totals[t.category] !== undefined) totals[t.category] += t.amount;
  }
  return totals;
}

export function budgetRows(month) {
  const spent = spendingByCategory(month);
  return EXPENSE_CATEGORIES.map((category) => {
    const budget = state.budgets[category] ?? 0;
    const used = spent[category] ?? 0;
    return {
      category,
      budget,
      spent: used,
      remaining: budget - used,
      pct: budget > 0 ? used / budget : 0,
      over: used > budget,
    };
  });
}

export function totalBudgeted() {
  return EXPENSE_CATEGORIES.reduce((sum, c) => sum + (state.budgets[c] ?? 0), 0);
}

export function addTransaction({ type, date, description, category, amount, note }) {
  const id = `user-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`;
  const tx = {
    id,
    date,
    description: description.trim(),
    category: type === 'income' ? 'Income' : category,
    type,
    amount: Math.round(amount * 100) / 100,
    note: (note ?? '').trim(),
  };
  state.transactions.push(tx);
  persist();
  return tx;
}

export function deleteTransaction(id) {
  const index = state.transactions.findIndex((t) => t.id === id);
  if (index === -1) return false;
  state.transactions.splice(index, 1);
  persist();
  return true;
}

export function setBudget(category, amount) {
  state.budgets[category] = Math.max(0, Math.round(amount * 100) / 100);
  persist();
}

export function addFunds(goalId, amount) {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return false;
  goal.saved = Math.round((goal.saved + amount) * 100) / 100;
  persist();
  return true;
}

export function createGoal(name, target) {
  const id = `goal-${Date.now().toString(36)}`;
  const goal = { id, name: name.trim(), target: Math.round(target * 100) / 100, saved: 0, note: 'A new goal for the Alvarez household.' };
  state.goals.push(goal);
  persist();
  return goal;
}

export function isBillPaid(billId, month) {
  return state.transactions.some((t) => t.billId === billId && monthOf(t.date) === month);
}

export function markBillPaid(bill) {
  if (isBillPaid(bill.id, CURRENT_MONTH)) return false;
  const id = `bill-${bill.id}-${Date.now().toString(36)}`;
  state.transactions.push({
    id,
    date: DEMO_TODAY,
    description: bill.name,
    category: bill.category,
    type: 'expense',
    amount: bill.amount,
    note: 'Bill paid',
    billId: bill.id,
  });
  persist();
  return true;
}

// Next occurrence of each bill after the demo "today", sorted soonest first.
export function upcomingBills(limit = 4) {
  const today = new Date(`${DEMO_TODAY}T00:00:00`);
  const list = BILLS.map((bill) => {
    let year = today.getFullYear();
    let month = today.getMonth();
    let due = new Date(year, month, bill.dueDay);
    if (due <= today) {
      month += 1;
      due = new Date(year, month, bill.dueDay);
    }
    const daysAway = Math.round((due - today) / 86400000);
    return { ...bill, dueDate: due, daysAway };
  });
  list.sort((a, b) => a.dueDate - b.dueDate);
  return list.slice(0, limit);
}

// Six months Jul–Nov 2026: Jul–Sep from stored aggregates, Oct–Nov computed.
export function monthlySeries() {
  const computed = ['2026-10', '2026-11'].map((month) => {
    const t = monthTotals(month);
    return { month, income: t.income, spent: t.spent };
  });
  return [...MONTHLY_HISTORY, ...computed];
}

export function topSpendingCategories(month, limit = 5) {
  const byCat = spendingByCategory(month);
  return Object.entries(byCat)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}
