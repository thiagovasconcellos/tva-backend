# Order Processing — Frontend

React 18 app that consumes the [Order Processing API](../README.md). Built with Vite, TypeScript, TailwindCSS and Vitest.

## Running locally

The API must be running first (Docker or `dotnet run`). Then:

```bash
cd frontend
npm install

# proxy defaults to http://localhost:3033 (Docker)
npm run dev

# to point at the local dotnet run port instead:
VITE_API_URL=http://localhost:5241 npm run dev
```

Open `http://localhost:5173`.

## Testing

```bash
npm run test:run    # run all tests once
npm run test        # watch mode
npm run test:ui     # browser UI for Vitest
npm run coverage    # coverage report
```

## Scripts

| Script | Description |
|---|---|
| `dev` | Start Vite dev server with hot reload |
| `build` | TypeScript check + production build |
| `preview` | Serve the production build locally |
| `test` | Run Vitest in watch mode |
| `test:run` | Run Vitest once (CI-friendly) |
| `coverage` | Generate v8 coverage report |
