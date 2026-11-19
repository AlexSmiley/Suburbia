# Suburbia frontend

A responsive React + TypeScript web client for the Suburbia Spring Boot REST API.

## Features

- Browse postcode and suburb records by Australian state or territory.
- Filter state results by suburb name or postcode.
- Search a postcode interval and display the alphabetically sorted suburbs and character total returned by the API.
- Submit postcode records with one or more suburb names.

## Requirements

- Node.js 18+
- Suburbia backend running locally on port 8080 (default Vite proxy target)

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

The Vite development server proxies API requests to http://localhost:8080. Start the Spring Boot application separately.

## API configuration

For a deployed frontend, set `VITE_API_BASE_URL` to the backend origin, for example:

```bash
VITE_API_BASE_URL=https://api.example.com npm run build
```

The backend must allow browser requests from the frontend origin (CORS) when they are hosted on different origins. No API routes or backend behavior are changed by this frontend.
