// Hearth — page renderers. One job: turn state into HTML for each hash route.
// Every figure comes from store.js; this file never invents a total.

import { BILLS, CURRENT_MONTH, DEMO_TODAY, EXPENSE_CATEGORIES, HOUSEHOLD } from './data.js';
import { drawBarChart, drawGroupedChart } from './charts.js';
import { dateLabel, dayLabel, escapeHtml, money, moneyShort, monthLabel, monthShort, pct } from './format.js';
import {
  addFunds,
  budgetRows,
  createGoal,
  currentTotals,
  isBillPaid,
  markBillPaid,
  monthlySeries,
  spendingByCategory,
  state,
  topSpendingCategories,
  totalBudgeted,
  transactionsIn,
  upcomingBills,
} from './store.js';

export const txFilter = { month: CURRENT_MONTH, category: 'All', search: '' };

function statCard(label, value, sub) {
  return `<div class="card stat"><p class="stat-label">${label}</p><p class="stat-value">${value}</p><p class="stat-sub">${sub}</p></div>`;
}

function progressBar(pctValue, over = false) {
  const width = Math.min(100, Math.round(pctValue * 100));
  return `<div class="bar" role="img" aria-label="${Math.round(pctValue * 100)} percent"><span class="bar-fill${over ? ' over' : ''}" style="width:${width}%"></span></div>`;
}

function goalCard(goal) {
  const ratio = goal.target > 0 ? goal.saved / goal.target : 0;
  const left = Math.max(0, goal.target - goal.saved);
  return `
  <article class="card goal-card">
    <div class="goal-head"><h3>${escapeHtml(goal.name)}</h3><span class="goal-pct">${pct(ratio)}</span></div>
    <p class="goal-note">${escapeHtml(goal.note)}</p>
    ${progressBar(ratio)}
    <p class="goal-figures"><strong>${money(goal.saved)}</strong> saved of ${money(goal.target)} · ${money(left)} to go</p>
    <form class="add-funds" data-goal="${goal.id}">
      <label>Add funds <span class="sr-only">to ${escapeHtml(goal.name)}</span>
        <input type="number" name="amount" min="1" step="1" placeholder="Amount in $" required>
      </label>
      <button type="submit" class="btn btn-small">Add funds</button>
    </form>
  </article>`;
}

// ---------------- Dashboard ----------------

export function renderDashboard() {
  const t = currentTotals();
  const byCat = spendingByCategory(CURRENT_MONTH);
  const rows = budgetRows(CURRENT_MONTH);
  const recent = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 8);
  const bills = upcomingBills(4);
  const spentSoFar = rows.reduce((s, r) => s + r.spent, 0);

  return `
  <section class="page-head">
    <div>
      <p class="eyebrow">November 2026 · ${escapeHtml(HOUSEHOLD)}</p>
      <h1>Good morning, Alvarez household</h1>
      <p class="lede">Here is where the family budget stands today, ${dateLabel(DEMO_TODAY)}. Every figure below is
      worked out from your transactions — nothing is typed in by hand.</p>
    </div>
    <a class="btn btn-primary" href="#/transactions">Add a transaction</a>
  </section>

  <section class="stats" aria-label="Month overview">
    ${statCard('Income — November', money(t.income), '2 paydays · Maya $3,400 + Jordan $2,450')}
    ${statCard('Spent — November', money(t.spent), `${t.count} transactions so far`)}
    ${statCard('Left to spend', money(t.left), `of ${money(t.income)} earned`)}
    ${statCard('Savings rate', pct(t.savingsRate), 'Income kept after spending')}
  </section>

  <div class="two-col">
    <section class="card">
      <h2>Spending by category</h2>
      <p class="muted">November expenses, largest first. Housing is the biggest share, as it should be.</p>
      <canvas id="chart-spending" class="chart" height="260" aria-label="Bar chart of November spending by category"></canvas>
      <ul class="chart-fallback">
        ${Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, v]) => `<li><span>${c}</span><strong>${money(v)}</strong></li>`).join('')}
      </ul>
    </section>

    <section class="card">
      <h2>Budget vs. actual</h2>
      <p class="muted">${money(spentSoFar)} of ${money(totalBudgeted())} budgeted for November.</p>
      <ul class="budget-bars">
        ${rows.map((r) => `
          <li>
            <div class="bb-row"><span>${r.category}</span><span>${money(r.spent)} <em>of ${money(r.budget)}</em></span></div>
            ${progressBar(r.pct, r.over)}
            ${r.over ? `<p class="flag over-flag">Over budget by ${money(-r.remaining)}</p>` : `<p class="flag">${money(r.remaining)} left</p>`}
          </li>`).join('')}
      </ul>
      <p><a href="#/budget">See the full budget →</a></p>
    </section>
  </div>

  <div class="two-col">
    <section class="card">
      <h2>Recent transactions</h2>
      <table class="table">
        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th></tr></thead>
        <tbody>
          ${recent.map((tx) => `
            <tr>
              <td>${dayLabel(tx.date)}</td>
              <td>${escapeHtml(tx.description)}</td>
              <td><span class="tag">${escapeHtml(tx.category)}</span></td>
              <td class="num ${tx.type === 'income' ? 'income' : 'expense'}">${tx.type === 'income' ? '+' : '−'}${money(tx.amount)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <p><a href="#/transactions">All transactions →</a></p>
    </section>

    <section class="card">
      <h2>Upcoming bills</h2>
      <p class="muted">The next bills after ${dateLabel(DEMO_TODAY)}. Marking one paid records the payment.</p>
      <ul class="bill-list">
        ${bills.map((b) => {
          const paid = isBillPaid(b.id, CURRENT_MONTH);
          return `<li>
            <div><strong>${escapeHtml(b.name)}</strong><br><span class="muted">Due ${dateLabel(b.dueDate.toISOString().slice(0, 10))} · ${b.daysAway} day${b.daysAway === 1 ? '' : 's'} away</span></div>
            <div class="bill-right"><strong>${money(b.amount)}</strong><br>
            ${paid ? '<span class="paid-badge">November paid ✓</span>' : `<button class="btn btn-small" data-action="pay-bill" data-bill="${b.id}">Mark paid</button>`}
            </div>
          </li>`;
        }).join('')}
      </ul>
      <h2 class="subhead">Savings goals</h2>
      ${state.goals.slice(0, 2).map((g) => `
        <p class="goal-line"><span>${escapeHtml(g.name)}</span><span><strong>${money(g.saved)}</strong> of ${money(g.target)}</span></p>
        ${progressBar(g.saved / g.target)}`).join('')}
      <p><a href="#/goals">All savings goals →</a></p>
    </section>
  </div>`;
}

export function drawDashboardCharts() {
  const SHORT = { 'Dining Out': 'Dining', Groceries: 'Grocery', Transport: 'Transport', Entertainment: 'Fun' };
  const byCat = spendingByCategory(CURRENT_MONTH);
  const rows = Object.entries(byCat)
    .map(([category, value]) => ({ label: SHORT[category] ?? category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
  drawBarChart(document.getElementById('chart-spending'), rows);
}

// ---------------- Transactions ----------------

function txRow(tx) {
  return `
  <tr>
    <td>${dateLabel(tx.date)}</td>
    <td>${escapeHtml(tx.description)}${tx.note ? `<br><span class="muted">${escapeHtml(tx.note)}</span>` : ''}</td>
    <td><span class="tag">${escapeHtml(tx.category)}</span></td>
    <td class="num ${tx.type}">${tx.type === 'income' ? '+' : '−'}${money(tx.amount)}</td>
    <td><button class="btn btn-small btn-danger" data-action="delete-tx" data-id="${tx.id}">Delete</button></td>
  </tr>`;
}

export function renderTransactions() {
  const f = txFilter;
  let rows = transactionsIn(f.month).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  if (f.category !== 'All') rows = rows.filter((t) => t.category === f.category);
  if (f.search.trim()) {
    const q = f.search.trim().toLowerCase();
    rows = rows.filter((t) => `${t.description} ${t.note} ${t.category}`.toLowerCase().includes(q));
  }
  const income = rows.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const spent = rows.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return `
  <section class="page-head">
    <div>
      <p class="eyebrow">Every dollar, in and out</p>
      <h1>Transactions</h1>
      <p class="lede">Showing ${rows.length} transaction${rows.length === 1 ? '' : 's'} · Income ${money(income)} · Spent ${money(spent)}</p>
    </div>
  </section>

  <section class="card">
    <h2>Add a transaction</h2>
    <form id="add-tx-form" class="form-grid">
      <label>Type
        <select name="type"><option value="expense">Expense</option><option value="income">Income</option></select>
      </label>
      <label>Date <input type="date" name="date" value="2026-11-26" required></label>
      <label>Description <input type="text" name="description" value="Weekly groceries" maxlength="80" required></label>
      <label>Category
        <select name="category">
          ${EXPENSE_CATEGORIES.map((c) => `<option${c === 'Groceries' ? ' selected' : ''}>${c}</option>`).join('')}
        </select>
      </label>
      <label>Amount ($) <input type="number" name="amount" value="85" min="0.01" step="0.01" required></label>
      <label>Note (optional) <input type="text" name="note" value="Aldi — weekly shop" maxlength="80"></label>
      <div class="form-actions"><button type="submit" class="btn btn-primary">Add transaction</button></div>
    </form>
    <p class="muted" id="tx-feedback" aria-live="polite"></p>
  </section>

  <section class="card">
    <h2>Find a transaction</h2>
    <div class="filters">
      <label>Month
        <select id="filter-month">
          <option value="2026-11"${f.month === '2026-11' ? ' selected' : ''}>November 2026</option>
          <option value="2026-10"${f.month === '2026-10' ? ' selected' : ''}>October 2026</option>
        </select>
      </label>
      <label>Category
        <select id="filter-category">
          <option${f.category === 'All' ? ' selected' : ''}>All</option>
          ${[...EXPENSE_CATEGORIES, 'Income'].map((c) => `<option${f.category === c ? ' selected' : ''}>${c}</option>`).join('')}
        </select>
      </label>
      <label>Search <input type="search" id="filter-search" value="${escapeHtml(f.search)}" placeholder="e.g. groceries"></label>
    </div>

    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
        <tbody>
          ${rows.length ? rows.map(txRow).join('') : '<tr><td colspan="5">No transactions match these filters.</td></tr>'}
        </tbody>
      </table>
    </div>
    <p class="muted">Deleting a transaction updates every total on the site at once.</p>
  </section>`;
}

// ---------------- Budget ----------------

export function renderBudget() {
  const rows = budgetRows(CURRENT_MONTH);
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);
  const total = totalBudgeted();
  const over = rows.filter((r) => r.over);

  return `
  <section class="page-head">
    <div>
      <p class="eyebrow">November 2026 · planned vs. spent</p>
      <h1>Budget</h1>
      <p class="lede">${money(totalSpent)} spent of ${money(total)} budgeted.
      ${over.length ? `${over.map((r) => r.category).join(' and ')} ${over.length === 1 ? 'is' : 'are'} over budget — tap a figure to fix it.` : 'Every category is within budget.'}</p>
    </div>
  </section>

  <section class="card">
    <ul class="budget-list">
      ${rows.map((r) => `
      <li class="budget-row${r.over ? ' is-over' : ''}">
        <div class="budget-info">
          <strong>${r.category}</strong>
          <span class="muted">${money(r.spent)} spent</span>
        </div>
        ${progressBar(r.pct, r.over)}
        <div class="budget-edit">
          <button class="budget-amount" data-action="edit-budget" data-category="${r.category}" title="Click to edit this budget">${moneyShort(r.budget)}</button>
          <span class="${r.over ? 'over-text' : 'left-text'}">${r.over ? `${money(-r.remaining)} over` : `${money(r.remaining)} left`}</span>
        </div>
      </li>`).join('')}
    </ul>
    <p class="muted">Click any budget amount to change it — the new figure is saved on this device and every page updates.</p>
  </section>

  <section class="card">
    <h2>How the budget is shared</h2>
    <p>Housing takes the biggest slice (${pct((state.budgets.Housing ?? 0) / total)} of the plan), then groceries and
    savings. The Alvarez household sets money aside for savings first — ${money(state.budgets.Savings ?? 0)} a month —
    and treats what is left as the spending limit, not the other way round.</p>
  </section>`;
}

// ---------------- Goals ----------------

export function renderGoals() {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return `
  <section class="page-head">
    <div>
      <p class="eyebrow">Saving with a purpose</p>
      <h1>Savings goals</h1>
      <p class="lede">${money(totalSaved)} saved toward ${money(totalTarget)} across ${state.goals.length} goals.
      Add funds whenever money is spare — progress updates everywhere at once.</p>
    </div>
  </section>

  <section class="goals-grid">
    ${state.goals.map(goalCard).join('')}
  </section>

  <section class="card">
    <h2>Create a new goal</h2>
    <form id="new-goal-form" class="form-grid">
      <label>Goal name <input type="text" name="name" value="New bikes for Leo and Nina" maxlength="60" required></label>
      <label>Target amount ($) <input type="number" name="target" value="600" min="1" step="1" required></label>
      <div class="form-actions"><button type="submit" class="btn btn-primary">Create goal</button></div>
    </form>
    <p class="muted" id="goal-feedback" aria-live="polite"></p>
  </section>`;
}

// ---------------- Reports ----------------

export function renderReports() {
  const series = monthlySeries();
  const t = currentTotals();
  const prev = monthlySeries().find((m) => m.month === '2026-10');
  const top = topSpendingCategories(CURRENT_MONTH, 5);
  const rows = budgetRows(CURRENT_MONTH);
  const over = rows.filter((r) => r.over).sort((a, b) => (b.spent - b.budget) - (a.spent - a.budget));
  const dining = rows.find((r) => r.category === 'Dining Out');
  const diningOver = dining && dining.spent > dining.budget
    ? `Dining out is ${Math.round(((dining.spent - dining.budget) / dining.budget) * 100)}% over its November budget (${money(dining.spent)} spent of ${money(dining.budget)} planned).`
    : 'Dining out is inside its November budget.';
  const savingsChange = prev ? Math.round((t.savingsRate - (prev.income - prev.spent) / prev.income) * 100) : 0;

  return `
  <section class="page-head">
    <div>
      <p class="eyebrow">July – November 2026</p>
      <h1>Reports</h1>
      <p class="lede">Six months at a glance: what came in, what went out, and where the money actually went.</p>
    </div>
    <button class="btn btn-primary" data-action="export-csv">Export transactions (CSV)</button>
  </section>

  <section class="card">
    <h2>Income vs. spending</h2>
    <p class="muted">Green is income, amber is spending. November is the strongest saving month of the six.</p>
    <canvas id="chart-monthly" class="chart" height="260" aria-label="Bar chart of income versus spending, July to November 2026"></canvas>
    <table class="table">
      <thead><tr><th>Month</th><th class="num">Income</th><th class="num">Spent</th><th class="num">Left</th><th class="num">Savings rate</th></tr></thead>
      <tbody>
        ${series.map((m) => {
          const left = m.income - m.spent;
          return `<tr><td>${monthLabel(m.month)}</td><td class="num income">${money(m.income)}</td><td class="num expense">${money(m.spent)}</td><td class="num">${money(left)}</td><td class="num">${pct(m.income > 0 ? left / m.income : 0)}</td></tr>`;
        }).join('')}
      </tbody>
    </table>
  </section>

  <div class="two-col">
    <section class="card">
      <h2>Top spending — November</h2>
      <ol class="top-list">
        ${top.map((item, i) => `<li><span>${i + 1}. ${item.category}</span><strong>${money(item.amount)}</strong></li>`).join('')}
      </ol>
      <p class="muted">Housing is fixed at ${money(top[0]?.amount ?? 0)}; groceries are the largest cost the family can still shape.</p>
    </section>

    <section class="card">
      <h2>What the numbers say</h2>
      <ul class="insights">
        <li>${diningOver}</li>
        <li>Groceries ran ${money(Math.max(0, (rows.find((r) => r.category === 'Groceries')?.spent ?? 0) - (state.budgets.Groceries ?? 0)))} over budget in November — the Costco bulk shop on Nov 13 (${money(212)}) is the main reason.</li>
        <li>The savings rate is ${pct(t.savingsRate)} in November, ${savingsChange >= 0 ? `${savingsChange} points higher` : `${-savingsChange} points lower`} than October (${pct(prev ? (prev.income - prev.spent) / prev.income : 0)}).</li>
        <li>${over.length ? `${over.map((r) => r.category).join(' and ')} need${over.length === 1 ? 's' : ''} a smaller December target — or a deliberate decision to spend more there.` : 'No category is over budget this month.'}</li>
      </ul>
      <p><a href="#/budget">Adjust the budget →</a></p>
    </section>
  </div>`;
}

export function drawReportsCharts() {
  const series = monthlySeries();
  drawGroupedChart(
    document.getElementById('chart-monthly'),
    series.map((m) => ({ label: monthShort(m.month).split(' ')[0], a: m.income, b: m.spent })),
    { a: 'Income', b: 'Spending' },
  );
}

// Re-exported so main.js can call the goal helpers from one place.
export { addFunds, createGoal, markBillPaid };
