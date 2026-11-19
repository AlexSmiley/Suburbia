# Suburbia

Suburbia is an Australian postcode and suburb application with two backend implementations and a shared React web frontend.

## Projects

| Folder | Technology | Default URL |
| --- | --- | --- |
| Repository root (src/) | Original Spring Boot / Java API | http://localhost:8080 |
| node-api/ | TypeScript / Express API with libSQL (local SQLite or hosted Turso) | http://localhost:3001 |
| frontend/ | React + TypeScript + Vite | http://localhost:5173 |

The original Spring Boot implementation remains intact. The React frontend and Node.js API are deployed as independent Vercel Services under one project and one domain.

## Deploy to Vercel

The root `vercel.json` defines two services:

- `frontend`: Vite application, public at `/` and all non-API paths.
- `node-api`: Express API, exposed only through `/health`, `/postcodes`, supported state paths, and numeric postcode-range paths.

In Vercel Project Settings, set the Framework Preset to **Services**. Connect the repository root (do not set either subdirectory as the project root), then add these environment variables to the Vercel project:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

Create a Turso database and token before deploying. The Node API fails fast in Vercel if these values are missing rather than silently writing to ephemeral storage. The API initializes its schema and seeds an empty hosted database from the bundled state JSON datasets.

There are no inter-service bindings: the browser calls the public API paths on the shared Vercel origin, and top-level rewrites route those paths to the Node API service.

Run `vercel dev` from the repository root to develop both services together.

## Run locally without Vercel

Start the Node API:

```bash
cd node-api
npm install
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server proxies API requests to `http://localhost:3001`. To run the original Java API instead, use the Maven wrapper or Maven installation from the repository root:

```bash
./mvnw spring-boot:run
```
