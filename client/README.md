# Elastic Fulfillment frontend

React/Vite operations workspace. Dashboard and Network load fulfillment nodes
from GET /api/nodes. Inventory loads GET /api/inventory with optional nodeId and
productId filters. Other screens remain placeholders. No forecasting, maps,
authentication, or operational write actions are implemented.

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
not-found message. API configuration is available in `src/config/api.js`.
Start the existing backend and MongoDB before opening the data screens. The
default example API base is http://localhost:5000/api. Screens support loading,
empty results, retryable errors, and manual refresh. Product IDs are displayed
because there is no product-list API. Counts are derived from node records, not
forecasts or utilization estimates. Development seed records are synthetic data
served by the real database; the frontend adds no fabricated records.

```powershell
npm.cmd run build
npm.cmd run preview
```

`dist/`, `node_modules/`, local `.env` files, and npm cache are excluded by the
existing root `.gitignore`.
