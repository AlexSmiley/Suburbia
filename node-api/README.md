# Suburbia Node.js API

A standalone TypeScript + Express implementation of the Suburbia REST API. It lives alongside the original Spring Boot application and the React frontend; it does not replace or modify either one.

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
- DATABASE_PATH: SQLite database file (default: ./data/suburbia.sqlite)

The database is created automatically on first startup. The data/ directory is intentionally ignored by Git.

## API

The routes retain the Spring API's request and response shapes:

- POST /postcodes: accepts an array of { "postcode": "2000", "name": ["Sydney"] } records and upserts them.
- GET /:state: returns records for an Australian state or territory code (ACT, NSW, NT, QLD, SA, TAS, VIC, WA).
- GET /:first/:second: returns { "suburb names:": [...], "total chars": 123 }, with suburb names sorted alphabetically and the character total calculated across the returned names.

Range boundaries are inclusive. The implementation uses SQLite for persistent local storage.

## Tests

    npm test
    npm run build

The API tests use an in-memory SQLite database and do not need a running server.

## Run alongside the other applications

- Spring Boot API: http://localhost:8080
- Node.js API: http://localhost:3001
- React frontend: http://localhost:5173

The frontend's Vite proxy currently defaults to the Spring Boot API on port 8080. To use the Node.js implementation, change its proxy target to port 3001, or configure the frontend API base URL for your deployment.
