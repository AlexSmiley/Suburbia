FROM node:22-alpine AS build
WORKDIR /app

# Install the API's dependencies and compile a self-contained Node.js bundle.
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build /app/dist/server.js ./server.js

EXPOSE 3001
CMD ["node", "server.js"]
