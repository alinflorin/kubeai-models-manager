import "dotenv/config";
import express from "express";
import { version } from "./version";
import errorHandler from "./middleware/error-handler";
import notFoundHandler from "./middleware/not-found-handler";
import * as k8s from "@kubernetes/client-node";
import { existsSync } from "fs";

const kc = new k8s.KubeConfig();
if (existsSync(process.env.HOME + "/.kube/config")) {
  kc.loadFromFile(process.env.HOME + "/.kube/config");
} else {
  kc.loadFromCluster();
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
  res.send(ns.items.map(x => x.metadata!.name));
});

app.get("/api/models", async (req, res) => {
  let ns: string | undefined = req.query.namespace as string;
  if (!ns) {
    ns = "default";
  }
  const models = await customApi.listClusterCustomObject({
    group: "kubeai.org",
    plural: "models",
    version: "v1",
  });
  res.send(models);
});

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
