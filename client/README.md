# Elastic Fulfillment frontend

React/Vite operations workspace with six placeholder screens. No live data,
forecasting, maps, authentication, or operational actions are implemented.

Use Node.js 22.12+ (Node.js 24 recommended) and npm. From `client/`:

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Open http://127.0.0.1:5173. Do not overwrite an existing `.env` when configuring
an already installed checkout. `VITE_API_BASE_URL` is public browser configuration;
never store secrets in it. Restart Vite after changing environment values.

Navigation uses hash URLs such as `/#/inventory`, supporting direct links and
browser back/forward without a routing dependency. Unknown screens show a
not-found message. API configuration is available in `src/config/api.js`, but
this shell intentionally makes no backend requests and claims no connection status.

```powershell
npm.cmd run build
npm.cmd run preview
```

`dist/`, `node_modules/`, local `.env` files, and npm cache are excluded by the
existing root `.gitignore`.
