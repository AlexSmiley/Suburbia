# Suburbia Node.js API

A standalone TypeScript + Express implementation of the existing Suburbia REST API. It lives alongside the original Spring Boot application and React frontend; it does not replace or modify either one.

## Requirements

- Node.js 20+
- npm

## Run

    cd node-api
    npm install
    npm run dev

The API listens on http://localhost:3001 by default. Build and run the production version with npm run build and npm start.

## Configuration

- PORT: HTTP port (default: 3001)
- DATABASE_PATH: SQLite database file (default: ./storage/suburbia.sqlite)

The API seeds its SQLite database on first startup from the bundled ACT, NSW, NT, QLD, SA, TAS, VIC, and WA datasets under data/states/. The storage/ directory is intentionally ignored by Git.

## API compatibility

The routes preserve the existing Spring API's request and response behavior:

- POST /postcodes: accepts an array of records with a four-digit postcode and a non-empty name list; upserts the records and returns the full stored collection.
- GET /:state: returns only records belonging to the requested bundled state or territory, sorted by postcode. State matching is case-insensitive; an unknown state returns 404.
- GET /:first/:second: clamps the range to 0000–9999, returns no results for an inverted range, deduplicates and sorts suburb names, and excludes spaces when calculating total chars.

The JSON response for a range has the same fields as the Spring implementation: suburb names: and total chars.

## Tests

    npm test
    npm run build

The API tests use an in-memory SQLite database and do not need a running server.

## Run alongside the other applications

- Spring Boot API: http://localhost:8080
- Node.js API: http://localhost:3001
- React frontend: http://localhost:5173

The Vite proxy defaults to the Spring API. Set VITE_API_PROXY_TARGET=http://localhost:3001 when starting Vite to proxy requests to this Node API instead.
