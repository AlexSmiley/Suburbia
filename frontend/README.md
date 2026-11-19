# Suburbia frontend

A responsive React + TypeScript web client for the Suburbia REST API.

## Features

- Browse postcode and suburb records by Australian state or territory.
- Filter state results by suburb name or postcode.
- Search a postcode interval and display the alphabetically sorted suburbs and character total returned by the API.
- Submit postcode records with one or more suburb names, separated by newline, comma, or semicolon.

## Requirements

- Node.js 18+
- One of the Suburbia backends running locally

## Run locally

    cd frontend
    npm install
    npm run dev

Open http://localhost:5173.

## Select the backend

The Vite development proxy defaults to the Spring Boot API at http://localhost:8080.

To use the Node.js API instead, start Vite with this environment variable:

    VITE_API_PROXY_TARGET=http://localhost:3001 npm run dev

The frontend code and API request/response contract are shared by both backends. For a deployed frontend, set VITE_API_BASE_URL to the backend origin, for example:

    VITE_API_BASE_URL=https://api.example.com npm run build

The backend must allow browser requests from the frontend origin (CORS) when hosted on different origins.
