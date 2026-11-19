# Suburbia Node.js API

The Node.js service is a TypeScript/Express API. The React application is built and deployed independently by Vercel as the `frontend` service.

## Requirements

- Node.js 20+
- npm

## Storage model

The API uses a process-local in-memory store. On startup, it loads the bundled ACT, NSW, NT, QLD, SA, TAS, VIC, and WA postcode JSON files into memory. No database service, connection string, token, or database setup is required.

**Important:** memory belongs to one running Node.js process. Vercel serverless instances do not share memory, and instances can be restarted or scaled down at any time. Changes submitted through `POST /postcodes` are temporary and may be lost when an instance is recycled. This design is suitable for read-only access to the bundled dataset and temporary writes, but not durable user data or consistent writes across multiple instances.

## Local development

From this directory:

```bash
npm install
npm run dev
```

The API listens on http://localhost:3001. In another terminal, run the frontend:

```bash
cd ../frontend
npm install
npm run dev
```

Vite proxies API requests to http://localhost:3001 by default. Set `VITE_API_PROXY_TARGET` to override the local API URL.

To run the production TypeScript build locally:

```bash
npm run build
npm start
```

## API

- `GET /health`: health response, including `storage: "in-memory"`.
- `POST /postcodes`: accepts an array of records with a four-digit postcode and a non-empty name list; upserts records in the current process memory and returns the full stored collection.
- `GET /:state`: returns records for ACT, NSW, NT, QLD, SA, TAS, VIC, or WA, sorted by postcode.
- `GET /:first/:second`: returns deduplicated and sorted suburb names within the postcode range and the count of characters excluding spaces.

The range response retains the original field names: `suburb names:` and `total chars`.

## Tests

```bash
npm test
```

Tests use isolated in-memory repository instances and do not require an external database.
