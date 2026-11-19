# Suburbia

Suburbia is an Australian postcode and suburb API with multiple backend implementations and a shared web frontend.

## Projects

| Folder | Technology | Default URL |
| --- | --- | --- |
| Repository root (src/) | Original Spring Boot / Java API | http://localhost:8080 |
| node-api/ | TypeScript, Express, SQLite API | http://localhost:3001 |
| frontend/ | React + TypeScript + Vite | http://localhost:5173 |

The Java and Node.js backends are independent implementations. Both remain in the repository.

## Run the Node.js API

    cd node-api
    npm install
    npm run dev

The Node.js API seeds its local SQLite database from the eight Australian state and territory datasets bundled in node-api/data/states/. See node-api/README.md for configuration, endpoints, and tests.

## Run the React frontend

    cd frontend
    npm install
    npm run dev

By default, Vite proxies API calls to the Spring Boot API on port 8080. To use the Node.js API, start Vite with VITE_API_PROXY_TARGET=http://localhost:3001.

## Run the original Java API

Use the Maven wrapper or Maven installation from the repository root:

    mvn spring-boot:run

The original Java application remains available alongside the Node.js backend.
