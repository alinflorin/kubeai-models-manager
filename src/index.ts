import express from "express";
import ViteExpress from 'vite-express';

const app = express();
app.use(express.json());

app.get("/api/health", (_, res) => {
  res.json({
    healthy: true,
  });
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."));