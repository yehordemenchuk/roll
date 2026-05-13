# CubeRoll Frontend

React + Vite frontend for the `GameStudioServer-Boy` backend.

## Start

1. Copy `.env.example` to `.env` only if you need a custom API URL.
2. Install dependencies:

```bash
npm install
```

3. Run dev server:

```bash
npm run dev
```

By default dev mode proxies `/api/*` requests to `http://localhost:8080`, so CORS setup is not required for local run.
