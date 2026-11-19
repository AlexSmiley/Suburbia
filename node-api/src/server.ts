import { createApp } from "./app";
import { loadStateData } from "./state-data";

const app = createApp(loadStateData());

export default app;

// Keep the same entrypoint usable for local development while allowing Vercel
// to import the Express application without opening a long-lived listener.
if (require.main === module) {
  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, () => {
    console.log(`Suburbia Node.js API listening on http://localhost:${port}`);
  });
}
