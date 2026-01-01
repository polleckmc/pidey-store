# Pidey Store — Static Top Up Website

Simple static website to sell game top-ups and direct orders to WhatsApp.

Files:
- `index.html` — User-facing store
- `admin.html` — Admin panel (hardcoded login)
- `style.css` — Styles
- `script.js` — Product data, stock, admin features (localStorage-based)

How to run:
1. Open `index.html` in a static host or directly in browser.
2. Admin page: open `admin.html` and login with **username:** `admin` / **password:** `pidey123`.

WhatsApp contact: 085334679379 (use via Order button on product page)

Admin features:
- Export products as JSON (`Export Produk`) and import JSON via `Import Produk`.
- Reset to default products (`Reset ke Default`).
- Add new product with ID, nominals, price, and stock.

Notes:
- Stock and product data persist in `localStorage` under the key `pidey_products_v1`.
- No backend or database used.

Deploy tip:
- You can deploy this site on GitHub Pages by pushing to a public repo and enabling Pages in the repo settings (serve from `main` branch / `/` folder).