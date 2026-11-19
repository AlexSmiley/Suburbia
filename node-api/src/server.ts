import { createApp } from "./app";
import { openDatabase } from "./database";
import { loadStateData } from "./state-data";

const port = Number(process.env.PORT ?? 3001);
const database = openDatabase();
const app = createApp(database, loadStateData());

const server = app.listen(port, () => {
  console.log(`Suburbia Node.js API listening on http://localhost:${port}`);
});

function shutdown() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);