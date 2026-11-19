# Suburbia Node.js API

The Node.js service is a TypeScript/Express API. The React application is built and deployed independently by Vercel as the `frontend` service.

## Requirements

- Node.js 20+
- npm

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

## Hosted database (Turso)

The API uses the libSQL client. In local development it defaults to a SQLite file at `./storage/suburbia.sqlite`. In Vercel it requires a hosted Turso database; it intentionally refuses to fall back to the ephemeral function filesystem.

Create a Turso database and generate an authentication token, then configure these environment variables for the Vercel project (Production, Preview, and Development as appropriate):

- `TURSO_DATABASE_URL`: the database URL, for example `libsql://your-database-your-org.turso.io`
- `TURSO_AUTH_TOKEN`: the database authentication token

Do not commit either value. The API creates its schema and seeds an empty database from the bundled ACT, NSW, NT, QLD, SA, TAS, VIC, and WA datasets on its first request. Subsequent instances reuse the persistent hosted database.

For local testing against Turso, set the same two environment variables before starting the API. When they are absent outside Vercel, the local SQLite file is used.

## API

- `GET /health`: health response.
- `POST /postcodes`: accepts an array of records with a four-digit postcode and a non-empty name list; upserts the records and returns the full stored collection.
- `GET /:state`: returns records for ACT, NSW, NT, QLD, SA, TAS, VIC, or WA, sorted by postcode.
- `GET /:first/:second`: returns deduplicated and sorted suburb names within the postcode range and the count of characters excluding spaces.

The range response retains the original field names: `suburb names:` and `total chars`.

## Tests

```bash
npm test
```

Tests use an in-memory libSQL database and do not require a hosted Turso account.
