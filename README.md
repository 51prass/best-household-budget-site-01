# best-household-budget-site-01

[![make.fun](https://img.shields.io/badge/make.fun-bounty-blue)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![owner](https://img.shields.io/badge/owner-51prass-green)](https://github.com/51prass)
[![repo](https://img.shields.io/badge/repo-best--household--budget--site--01-orange)](https://github.com/51prass/best-household-budget-site-01)

Hearth is a working household budget site: track household income and spending, set category budgets, save toward goals and read monthly reports — all in the browser, with data saved on your device.

## What it does

- **Dashboard** — November 2026 at a glance: income, spent, left to spend and savings rate, all computed from the transaction list; spending-by-category chart, budget-vs-actual bars, recent transactions, savings-goal progress and upcoming bills.
- **Transactions** — the full table with category filter, search and a month selector (October / November 2026). Add a transaction and every total updates; delete any row.
- **Budget** — monthly budget per category with progress bars, remaining or over-budget amounts, and click-to-edit budget figures that save.
- **Goals** — savings goals with progress bars, add funds to any goal, and a form to create a new goal.
- **Reports** — six months of income vs. spending in a chart, a monthly totals table, top spending categories, plain-language insights, and a CSV export that really downloads your transactions.

Everything runs from static files under `app/` — no build step, no network request, no framework. Data is stored in `localStorage` on the device, and a "Reset demo data" button in the footer restores the demo household (Maya & Jordan Alvarez, fictional, November 2026).

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080

## Files

- `app/index.html` — shell, navigation, mount points
- `app/style.css` — all styling
- `app/data.js` — seed data, categories, bills, goals, storage load/save
- `app/store.js` — state, derived totals, budget math
- `app/format.js` — money and date formatting
- `app/charts.js` — hand-drawn canvas bar charts
- `app/views.js` — page renderers: dashboard, transactions, budget, goals, reports
- `app/main.js` — hash router, boot, form wiring
- `main.ts` — the make.fun entry program (copies `app/` + `screenshots/` to `/output` and writes `dossier.json`)

## License

MIT — see [LICENSE](LICENSE).

---

Built for make.fun — [Make the best household budget site](https://make.fun/bounty/best-household-budget-site-20261126-1457?ref=kq36bfy4)
