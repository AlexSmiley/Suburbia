# Suburbia

Suburbia is an Australian postcode and suburb application with two backend implementations and a shared React web frontend.

## Projects

| Folder | Technology | Default URL |
| --- | --- | --- |
| Repository root (src/) | Original Spring Boot / Java API | http://localhost:8080 |
| node-api/ | Full-stack Node.js + Express + SQLite + React application | http://localhost:3001 |
| frontend/ | Standalone React + TypeScript + Vite workspace | http://localhost:5173 |

The original Spring Boot implementation remains intact. The Node.js application builds and serves the same React frontend from Express, so its UI and API are available from one origin.

## Run the complete Node.js application

    cd node-api
    npm install
    npm run build
    npm start

Open http://localhost:3001.

For development with frontend hot reload, start the API with npm run dev:api from node-api, then start the Vite app with npm run dev:frontend in another terminal. Open http://localhost:5173.

## Run the original Java API

Use the Maven wrapper or Maven installation from the repository root:

    mvn spring-boot:run

The Spring Boot backend and full-stack Node.js application can be run independently.
