// Hearth — hash router and boot. One job: show the right page and wire its controls.
// All page actions go through one delegated click/submit handler on #app.

import { BILLS, CURRENT_MONTH, EXPENSE_CATEGORIES } from './data.js';
import { addFunds, createGoal, markBillPaid, state } from './store.js';
import {
  addTransaction,
  deleteTransaction,
  resetDemoData,
  setBudget,
} from './store.js';
import { drawDashboardCharts, drawReportsCharts, renderBudget, renderDashboard, renderGoals, renderReports, renderTransactions, txFilter } from './views.js';
import { dateLabel, escapeHtml, money } from './format.js';

const app = document.getElementById('app');

const ROUTES = {
  '': { render: renderDashboard, draw: drawDashboardCharts, title: 'Dashboard' },
  transactions: { render: renderTransactions, draw: null, title: 'Transactions' },
  budget: { render: renderBudget, draw: null, title: 'Budget' },
  goals: { render: renderGoals, draw: null, title: 'Goals' },
  reports: { render: renderReports, draw: drawReportsCharts, title: 'Reports' },
};

function currentRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const key = hash.split('/')[0];
  return ROUTES[key] ? key : '';
}

function render() {
  const key = currentRoute();
  const route = ROUTES[key];
  app.innerHTML = route.render();
  document.querySelectorAll('nav a').forEach((a) => {
    const href = a.getAttribute('href') ?? '';
    a.classList.toggle('active', href === `#/${key}` || (key === '' && href === '#/'));
  });
  if (route.draw) requestAnimationFrame(() => route.draw());
  document.title = `Hearth — ${route.title} · Alvarez household budget`;
  window.scrollTo(0, 0);
}

function rerender() {
  render();
}

function downloadCsv() {
  const header = 'date,description,category,type,amount,note';
  const lines = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .map((t) => {
      const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      return [t.date, cell(t.description), t.category, t.type, t.amount.toFixed(2), cell(t.note)].join(',');
    });
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;

  if (action === 'delete-tx') {
    if (deleteTransaction(button.dataset.id)) rerender();
  }

  if (action === 'pay-bill') {
    const bill = BILLS.find((b) => b.id === button.dataset.bill);
    if (bill && markBillPaid(bill)) rerender();
  }

  if (action === 'export-csv') {
    downloadCsv();
  }

  if (action === 'edit-budget') {
    const category = button.dataset.category;
    const current = state.budgets[category] ?? 0;
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '1';
    input.value = String(current);
    input.className = 'budget-input';
    input.setAttribute('aria-label', `Monthly budget for ${category}`);
    button.replaceWith(input);
    input.focus();
    input.select();
    const commit = () => {
      const value = Number(input.value);
      if (Number.isFinite(value) && value >= 0) setBudget(category, value);
      rerender();
    };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') rerender();
    });
  }
});

app.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;

  if (form.id === 'add-tx-form') {
    const data = new FormData(form);
    const type = data.get('type') === 'income' ? 'income' : 'expense';
    const amount = Number(data.get('amount'));
    const date = String(data.get('date') || '2026-11-26');
    const description = String(data.get('description') || '').trim();
    const category = String(data.get('category') || 'Other');
    const note = String(data.get('note') || '');
    if (!description || !Number.isFinite(amount) || amount <= 0) return;
    addTransaction({ type, date, description, category, amount, note });
    const feedback = document.getElementById('tx-feedback');
    if (feedback) feedback.textContent = `Added ${type === 'income' ? 'income' : 'expense'} of ${money(amount)} — ${description}. Totals updated everywhere.`;
    form.reset();
    // Keep the form friendly for the next entry.
    form.elements.date.value = '2026-11-26';
    form.elements.description.value = '';
    form.elements.amount.value = '';
    form.elements.note.value = '';
    txFilter.month = date.slice(0, 7) === '2026-10' ? '2026-10' : '2026-11';
    rerender();
    const after = document.getElementById('tx-feedback');
    if (after) after.textContent = `Added ${type === 'income' ? 'income' : 'expense'} of ${money(amount)} — ${description}. Totals updated everywhere.`;
  }

  if (form.id === 'new-goal-form') {
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const target = Number(data.get('target'));
    if (!name || !Number.isFinite(target) || target <= 0) return;
    createGoal(name, target);
    rerender();
    const feedback = document.getElementById('goal-feedback');
    if (feedback) feedback.textContent = `Goal “${name}” created with a ${money(target)} target.`;
  }

  if (form.classList.contains('add-funds')) {
    const data = new FormData(form);
    const amount = Number(data.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) return;
    if (addFunds(form.dataset.goal, amount)) rerender();
  }
});

app.addEventListener('change', (event) => {
  const target = event.target;
  if (target.id === 'filter-month') {
    txFilter.month = target.value;
    rerender();
  }
  if (target.id === 'filter-category') {
    txFilter.category = target.value;
    rerender();
  }
});

app.addEventListener('input', (event) => {
  const target = event.target;
  if (target.id === 'filter-search') {
    txFilter.search = target.value;
    // Re-render only the table body would be nicer; a full re-render keeps
    // the code small, but it would steal focus from the search box, so
    // update the list in place instead.
    const rows = [...state.transactions]
      .filter((t) => t.date.slice(0, 7) === txFilter.month)
      .filter((t) => txFilter.category === 'All' || t.category === txFilter.category)
      .filter((t) => `${t.description} ${t.note} ${t.category}`.toLowerCase().includes(target.value.trim().toLowerCase()))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    const tbody = document.querySelector('.table tbody');
    if (!tbody) return;
    tbody.innerHTML = rows.length
      ? rows.map((t) => `<tr>
          <td>${dateLabel(t.date)}</td>
          <td>${escapeHtml(t.description)}${t.note ? `<br><span class="muted">${escapeHtml(t.note)}</span>` : ''}</td>
          <td><span class="tag">${escapeHtml(t.category)}</span></td>
          <td class="num ${t.type}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td>
          <td><button class="btn btn-small btn-danger" data-action="delete-tx" data-id="${t.id}">Delete</button></td>
        </tr>`).join('')
      : '<tr><td colspan="5">No transactions match these filters.</td></tr>';
  }
});

document.getElementById('reset-demo')?.addEventListener('click', () => {
  resetDemoData();
  txFilter.month = CURRENT_MONTH;
  txFilter.category = 'All';
  txFilter.search = '';
  render();
});

window.addEventListener('hashchange', render);
window.addEventListener('resize', () => {
  const route = ROUTES[currentRoute()];
  if (route.draw) route.draw();
});

render();
