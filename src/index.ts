import "dotenv/config";
import express from "express";
import notFoundMiddleware from "./middlewares/not-found.middleware";
import errorHandlerMiddleware from "./middlewares/error-handler.middleware";
import type { HealthCheckResponseDto } from "./models/health-check-response.dto";
import * as k8s from "@kubernetes/client-node";
import { type Model, ModelSchema } from "./models/model";
import { existsSync } from "fs";
import type { ErrorDto } from "./models/error.dto";

const app = express();
app.use(express.json());

const kc = new k8s.KubeConfig();
if (existsSync(process.env.HOME + "/.kube/config")) {
  kc.loadFromFile(process.env.HOME + "/.kube/config");
} else {
  kc.loadFromCluster();
}

const customApi = kc.makeApiClient(k8s.CustomObjectsApi);

app.get("/api/health", (_, res) => {
  res.json({
    healthy: true,
  } as HealthCheckResponseDto);
});

app.get("/api/openrouter/models", async (_, res) => {
  let models: any;
  try {
    models = await customApi.listCustomObjectForAllNamespaces({
      group: "kubeai.org",
      plural: "models",
      version: "v1",
    });
  } catch (error: any) {
    console.error("Error fetching models for OpenRouter:", error.message);
    return res.status(500).json({"": ["Failed to fetch models"]  } as ErrorDto);
  }

  const parsedModels: Model[] = models.items.map((item: any) =>
    ModelSchema.parse(item)
  );

  const openRouterModels = parsedModels.filter((model) => !!model.metadata.annotations?.["openrouter.ai/json"])
    .map(x => JSON.stringify(x.metadata.annotations!["openrouter.ai/json"]));

  res.json({ data: openRouterModels });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(3000, () =>
  console.log("Server is listening on port 3000...")
);
