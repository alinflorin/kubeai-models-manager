import "dotenv/config";
import express from "express";
import { version } from "./version";
import errorHandler from "./middleware/error-handler";
import notFoundHandler from "./middleware/not-found-handler";
import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();

if (process.env.NODE_ENV === "production") {
  kc.loadFromCluster();
} else {
  kc.loadFromFile(process.env.HOME + "/.kube/config");
}

const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const customApi = kc.makeApiClient(k8s.CustomObjectsApi);

const app = express();
app.use(express.json()); ///  req.body

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", version: version });
});

app.get("/api/namespaces", async (req, res) => {
  const ns = await coreApi.listNamespace();
  res.send(ns);
});

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
