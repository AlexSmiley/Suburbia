# Suburbia Node.js application

A full-stack Suburbia application: the Express API serves the compiled React + TypeScript frontend from the same origin. The original Spring Boot backend and the standalone frontend workspace remain in the repository.

## Requirements

- Node.js 20+
- npm

## Build and run the complete application

From this directory:

    npm install
    npm run build
    npm start

Open http://localhost:3001. The build command installs the frontend workspace dependencies, builds the React application into node-api/public/, and compiles the TypeScript API. Express then serves the frontend and API together.

For a development run that rebuilds the frontend before starting the Node server:

    npm run dev

For frontend hot-module-reload during UI development, run the API and Vite in separate terminals:

Terminal 1:

    npm run dev:api

Terminal 2:

    npm run dev:frontend

Open http://localhost:5173. Vite proxies API requests to http://localhost:3001 by default. Set VITE_API_PROXY_TARGET to override that target.

## Configuration

- PORT: HTTP port (default: 3001)
- DATABASE_PATH: SQLite database file (default: ./storage/suburbia.sqlite)

The API seeds its SQLite database on first startup from the bundled ACT, NSW, NT, QLD, SA, TAS, VIC, and WA datasets under data/states/. The storage/ directory is intentionally ignored by Git.

## API

- GET /: serves the React web application.
- GET /health: returns a small service health response.
- POST /postcodes: accepts an array of records with a four-digit postcode and a non-empty name list; upserts the records and returns the full stored collection.
- GET /:state: returns only records belonging to the requested bundled state or territory, sorted by postcode. State matching is case-insensitive; an unknown state returns 404.
- GET /:first/:second: clamps bounds to 0000–9999, returns no results for an inverted range, deduplicates and sorts suburb names, and excludes spaces when calculating total chars.

The range JSON response retains the Spring API field names: suburb names: and total chars.

## Tests

    npm test

The API tests use an in-memory SQLite database and do not need a running server.

## Run alongside the other applications

- Spring Boot API: http://localhost:8080
- Full-stack Node.js application (frontend + API): http://localhost:3001
- Standalone Vite development frontend: http://localhost:5173

The standalone frontend uses the same React source and can be configured to proxy requests to the Node API.
