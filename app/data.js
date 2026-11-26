// Hearth — seed data and storage.
// One job: hold the demo household's data and load/save it on the device.
// All money is USD. The demo month is November 2026; the demo "today"
// is 26 November 2026 so due dates and "upcoming bills" stay stable.

export const STORAGE_KEY = 'hearth-budget-v1';
export const DEMO_TODAY = '2026-11-26';
export const HOUSEHOLD = 'Maya & Jordan Alvarez';
export const CURRENT_MONTH = '2026-11';

export const CATEGORIES = [
  'Housing',
  'Groceries',
  'Transport',
  'Dining Out',
  'Utilities',
  'Entertainment',
  'Health',
  'Kids',
  'Savings',
  'Other',
  'Income',
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== 'Income');

// Monthly budget targets for November 2026, per expense category.
export const DEFAULT_BUDGETS = {
  Housing: 1500,
  Groceries: 650,
  Transport: 320,
  'Dining Out': 220,
  Utilities: 380,
  Entertainment: 150,
  Health: 200,
  Kids: 250,
  Savings: 800,
  Other: 100,
};

// Recurring household bills. A bill counts as paid when a November
// transaction carries its billId; "Mark paid" adds that transaction.
export const BILLS = [
  { id: 'rent', name: 'Rent — Alvarez home', amount: 1450, category: 'Housing', dueDay: 1 },
  { id: 'internet', name: 'Internet — Fiber 500', amount: 65, category: 'Utilities', dueDay: 8 },
  { id: 'electric', name: 'Electric bill', amount: 132, category: 'Utilities', dueDay: 12 },
  { id: 'phone', name: 'Phone plan (2 lines)', amount: 85, category: 'Utilities', dueDay: 15 },
  { id: 'insurance', name: 'Car insurance', amount: 118, category: 'Transport', dueDay: 20 },
  { id: 'water', name: 'Water bill', amount: 48, category: 'Utilities', dueDay: 25 },
];

export const DEFAULT_GOALS = [
  { id: 'emergency', name: 'Emergency fund', target: 10000, saved: 6250, note: 'Six months of essentials, for peace of mind.' },
  { id: 'trip', name: 'Family summer trip', target: 2400, saved: 1120, note: 'A week by the coast with Leo and Nina.' },
  { id: 'washer', name: 'New washing machine', target: 900, saved: 540, note: 'The old one rattles on every spin cycle.' },
];

// Monthly aggregates for Jul–Sep 2026 (before the seeded transaction
// history starts). Oct and Nov are always computed from transactions.
export const MONTHLY_HISTORY = [
  { month: '2026-07', income: 5850, spent: 3620 },
  { month: '2026-08', income: 5850, spent: 3410 },
  { month: '2026-09', income: 5850, spent: 3785 },
];

// Seeded transactions. type: 'income' | 'expense'. billId links a payment
// to one of BILLS. ids are stable so deletes and edits stay predictable.
export const SEED_TRANSACTIONS = [
  // ---- October 2026 ----
  { id: 'oct-01', date: '2026-10-01', description: 'Maya salary — October', category: 'Income', type: 'income', amount: 3400, note: 'Payday' },
  { id: 'oct-02', date: '2026-10-01', description: 'Rent — Alvarez home', category: 'Housing', type: 'expense', amount: 1450, note: '', billId: 'rent' },
  { id: 'oct-03', date: '2026-10-02', description: 'Whole Foods Market', category: 'Groceries', type: 'expense', amount: 168, note: 'Weekly shop' },
  { id: 'oct-04', date: '2026-10-04', description: 'Shell — gas', category: 'Transport', type: 'expense', amount: 45, note: '' },
  { id: 'oct-05', date: '2026-10-06', description: 'Sushi dinner', category: 'Dining Out', type: 'expense', amount: 52, note: 'Date night' },
  { id: 'oct-06', date: '2026-10-08', description: 'Internet — Fiber 500', category: 'Utilities', type: 'expense', amount: 65, note: '', billId: 'internet' },
  { id: 'oct-07', date: '2026-10-09', description: 'Kids’ art class fees', category: 'Kids', type: 'expense', amount: 120, note: 'Leo and Nina' },
  { id: 'oct-08', date: '2026-10-11', description: 'Trader Joe’s', category: 'Groceries', type: 'expense', amount: 142, note: 'Weekly shop' },
  { id: 'oct-09', date: '2026-10-12', description: 'Electric bill', category: 'Utilities', type: 'expense', amount: 128, note: '', billId: 'electric' },
  { id: 'oct-10', date: '2026-10-13', description: 'AMC movie night', category: 'Entertainment', type: 'expense', amount: 28, note: '' },
  { id: 'oct-11', date: '2026-10-15', description: 'Jordan salary — October', category: 'Income', type: 'income', amount: 2450, note: 'Payday' },
  { id: 'oct-12', date: '2026-10-15', description: 'Phone plan (2 lines)', category: 'Utilities', type: 'expense', amount: 85, note: '', billId: 'phone' },
  { id: 'oct-13', date: '2026-10-16', description: 'CVS — cold medicine', category: 'Health', type: 'expense', amount: 62, note: '' },
  { id: 'oct-14', date: '2026-10-17', description: 'Costco groceries', category: 'Groceries', type: 'expense', amount: 198, note: 'Bulk shop' },
  { id: 'oct-15', date: '2026-10-18', description: 'Burger joint — family lunch', category: 'Dining Out', type: 'expense', amount: 38, note: '' },
  { id: 'oct-16', date: '2026-10-20', description: 'Car insurance', category: 'Transport', type: 'expense', amount: 118, note: '', billId: 'insurance' },
  { id: 'oct-17', date: '2026-10-21', description: 'Water bill', category: 'Utilities', type: 'expense', amount: 52, note: '', billId: 'water' },
  { id: 'oct-18', date: '2026-10-22', description: 'Nina’s birthday gift', category: 'Kids', type: 'expense', amount: 44, note: '' },
  { id: 'oct-19', date: '2026-10-24', description: 'Transfer to emergency fund', category: 'Savings', type: 'expense', amount: 500, note: 'Automatic transfer' },
  { id: 'oct-20', date: '2026-10-26', description: 'Target — household items', category: 'Other', type: 'expense', amount: 58, note: '' },
  { id: 'oct-21', date: '2026-10-27', description: 'Gas station', category: 'Transport', type: 'expense', amount: 36, note: '' },
  { id: 'oct-22', date: '2026-10-28', description: 'Thai takeout', category: 'Dining Out', type: 'expense', amount: 71, note: '' },
  { id: 'oct-23', date: '2026-10-29', description: 'Dentist checkup — Leo', category: 'Health', type: 'expense', amount: 28, note: '' },
  { id: 'oct-24', date: '2026-10-30', description: 'Amazon — batteries & bulbs', category: 'Other', type: 'expense', amount: 36, note: '' },
  { id: 'oct-25', date: '2026-10-31', description: 'Spotify family plan', category: 'Entertainment', type: 'expense', amount: 16, note: '' },

  // ---- November 2026 ----
  { id: 'nov-01', date: '2026-11-01', description: 'Maya salary — November', category: 'Income', type: 'income', amount: 3400, note: 'Payday' },
  { id: 'nov-02', date: '2026-11-01', description: 'Rent — Alvarez home', category: 'Housing', type: 'expense', amount: 1450, note: '', billId: 'rent' },
  { id: 'nov-03', date: '2026-11-02', description: 'Whole Foods Market', category: 'Groceries', type: 'expense', amount: 186, note: 'Weekly shop' },
  { id: 'nov-04', date: '2026-11-03', description: 'Shell — gas', category: 'Transport', type: 'expense', amount: 42, note: '' },
  { id: 'nov-05', date: '2026-11-04', description: 'Chipotle lunch', category: 'Dining Out', type: 'expense', amount: 28, note: 'Work lunch' },
  { id: 'nov-06', date: '2026-11-05', description: 'Netflix', category: 'Entertainment', type: 'expense', amount: 16, note: 'Monthly plan' },
  { id: 'nov-07', date: '2026-11-06', description: 'CVS pharmacy', category: 'Health', type: 'expense', amount: 34, note: '' },
  { id: 'nov-08', date: '2026-11-07', description: 'Trader Joe’s', category: 'Groceries', type: 'expense', amount: 124, note: 'Weekly shop' },
  { id: 'nov-09', date: '2026-11-08', description: 'Internet — Fiber 500', category: 'Utilities', type: 'expense', amount: 65, note: '', billId: 'internet' },
  { id: 'nov-10', date: '2026-11-09', description: 'Kids’ soccer registration', category: 'Kids', type: 'expense', amount: 85, note: 'Leo — spring season' },
  { id: 'nov-11', date: '2026-11-10', description: 'Pizza night', category: 'Dining Out', type: 'expense', amount: 46, note: 'Family dinner' },
  { id: 'nov-12', date: '2026-11-11', description: 'Target — household items', category: 'Other', type: 'expense', amount: 73, note: '' },
  { id: 'nov-13', date: '2026-11-12', description: 'Electric bill', category: 'Utilities', type: 'expense', amount: 132, note: '', billId: 'electric' },
  { id: 'nov-14', date: '2026-11-13', description: 'Costco groceries', category: 'Groceries', type: 'expense', amount: 212, note: 'Bulk shop' },
  { id: 'nov-15', date: '2026-11-14', description: 'Uber — airport run', category: 'Transport', type: 'expense', amount: 18, note: '' },
  { id: 'nov-16', date: '2026-11-15', description: 'Jordan salary — November', category: 'Income', type: 'income', amount: 2450, note: 'Payday' },
  { id: 'nov-17', date: '2026-11-15', description: 'Phone plan (2 lines)', category: 'Utilities', type: 'expense', amount: 85, note: '', billId: 'phone' },
  { id: 'nov-18', date: '2026-11-16', description: 'Movie night — cinema', category: 'Entertainment', type: 'expense', amount: 32, note: 'Family outing' },
  { id: 'nov-19', date: '2026-11-17', description: 'Pediatrician copay', category: 'Health', type: 'expense', amount: 45, note: 'Nina checkup' },
  { id: 'nov-20', date: '2026-11-18', description: 'Olive Garden dinner', category: 'Dining Out', type: 'expense', amount: 64, note: 'Family dinner' },
  { id: 'nov-21', date: '2026-11-19', description: 'Gas station', category: 'Transport', type: 'expense', amount: 38, note: '' },
  { id: 'nov-22', date: '2026-11-20', description: 'Car insurance', category: 'Transport', type: 'expense', amount: 118, note: '', billId: 'insurance' },
  { id: 'nov-23', date: '2026-11-21', description: 'School supplies', category: 'Kids', type: 'expense', amount: 52, note: 'Leo — art project' },
  { id: 'nov-24', date: '2026-11-22', description: 'Whole Foods Market', category: 'Groceries', type: 'expense', amount: 158, note: 'Weekly shop' },
  { id: 'nov-25', date: '2026-11-23', description: 'Gym membership', category: 'Health', type: 'expense', amount: 40, note: 'Monthly' },
  { id: 'nov-26', date: '2026-11-24', description: 'Coffee shop', category: 'Dining Out', type: 'expense', amount: 12, note: 'Maya — morning coffee' },
  { id: 'nov-27', date: '2026-11-24', description: 'Spotify family plan', category: 'Entertainment', type: 'expense', amount: 11, note: 'Monthly plan' },
  { id: 'nov-28', date: '2026-11-25', description: 'Aldi groceries', category: 'Groceries', type: 'expense', amount: 96, note: 'Weekly shop' },
  { id: 'nov-29', date: '2026-11-25', description: 'Water bill', category: 'Utilities', type: 'expense', amount: 48, note: '', billId: 'water' },
  { id: 'nov-30', date: '2026-11-26', description: 'Transfer to emergency fund', category: 'Savings', type: 'expense', amount: 500, note: 'Automatic transfer' },
  { id: 'nov-31', date: '2026-11-26', description: 'Amazon — household', category: 'Other', type: 'expense', amount: 41, note: 'Cleaning supplies' },
];

export function freshState() {
  return {
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
    budgets: { ...DEFAULT_BUDGETS },
    goals: DEFAULT_GOALS.map((g) => ({ ...g })),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.transactions) || typeof parsed.budgets !== 'object' || !Array.isArray(parsed.goals)) {
      return freshState();
    }
    return parsed;
  } catch {
    return freshState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: the site still works for this visit.
  }
}
