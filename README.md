# Pidey Store — Static Top Up Website

[![CI](https://github.com/polleckmc/pidey-store/actions/workflows/ci.yml/badge.svg)](https://github.com/polleckmc/pidey-store/actions/workflows/ci.yml)
[![Pages Deploy](https://github.com/polleckmc/pidey-store/actions/workflows/pages.yml/badge.svg)](https://github.com/polleckmc/pidey-store/actions/workflows/pages.yml)

Simple static website to sell game top-ups and direct orders to WhatsApp.

Files:
- `index.html` — User-facing store
- `admin.html` — Admin panel (hardcoded login)
- `style.css` — Styles
- `data.js` — Default games and product catalogs
- `script.js` — App logic, localStorage persistence, admin features

How to run:
1. Open `index.html` in a static host or directly in browser.
2. Admin page: open `admin.html` and login with **username:** `admin` / **password:** `pidey123`.

WhatsApp contact: 085334679379 (use via Order button on product page)

Admin features:
- Export games/products as JSON (`Export Produk`) and import JSON via `Import Produk`.
- Reset to default games (`Reset ke Default`).
- Add new game and add/edit packages per game.

Notes:
- Data persist in `localStorage` under the key `pidey_games_v1`.
- The project supports migration from the legacy format (old `nominals`-based products).
- No backend or database used.

Deploy tip:
- You can deploy this site on GitHub Pages by pushing to a public repo and enabling Pages in the repo settings (serve from `main` branch / `/` folder).

CI & Deployment
- A GitHub Actions workflow (`.github/workflows/ci.yml`) runs the test suite (`npm test`) on push and PRs to `main`.
- A workflow (`.github/workflows/pages.yml`) deploys the repo to GitHub Pages on push to `main`.

How to enable:
1. Push this repo to GitHub (public preferred for Pages).
2. On the repo, go to Settings → Pages and confirm the site is served from the `gh-pages` deployment (the workflow will publish automatically).
3. Ensure Actions are enabled for the repo so CI and Pages deploy can run.