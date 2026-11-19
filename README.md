# Suburbia

Suburbia is an Australian postcode and suburb API with multiple backend implementations and a shared web frontend.

## Projects

| Folder | Technology | Default URL |
| --- | --- | --- |
| Repository root (src/) | Original Spring Boot / Java API | http://localhost:8080 |
| node-api/ | TypeScript, Express, SQLite API | http://localhost:3001 |
| frontend/ | React + TypeScript + Vite | http://localhost:5173 |

The Java and Node.js backends are separate implementations. Neither replaces the other.

## Run the Node.js API

    cd node-api
    npm install
    npm run dev

See node-api/README.md for configuration, endpoints, and tests.

## Run the React frontend

    cd frontend
    npm install
    npm run dev

The existing Vite proxy defaults to the Spring Boot API on port 8080. To use the Node.js implementation, change its proxy target in frontend/vite.config.ts to http://localhost:3001.

## Run the original Java API

Use the Maven wrapper or Maven installation from the repository root:

    mvn spring-boot:run

The original Java application remains available alongside the Node.js backend.
