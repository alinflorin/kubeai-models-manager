import 'dotenv/config';
import express from "express";
import ViteExpress from "vite-express";
import notFoundMiddleware from "./middlewares/not-found.middleware";
import errorHandlerMiddleware from "./middlewares/error-handler.middleware";
import type { HealthCheckResponseDto } from "./models/health-check-response.dto";
import * as k8s from "@kubernetes/client-node";
import { type Model, ModelSchema } from "./models/model";
import type { ErrorDto } from "./models/error.dto";
import { existsSync } from "fs";

const app = express();
app.use(express.json());

const kc = new k8s.KubeConfig();
if (existsSync(process.env.HOME + "/.kube/config")) {
  kc.loadFromFile(process.env.HOME + "/.kube/config");
} else {
  kc.loadFromCluster();
}

const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const customApi = kc.makeApiClient(k8s.CustomObjectsApi);

app.get("/api/health", (_, res) => {
  res.json({
    healthy: true,
  } as HealthCheckResponseDto);
});

app.get("/api/namespaces", async (_, res) => {
  const ns = await coreApi.listNamespace();
  res.send(ns.items.map((x) => x.metadata!.name));
});

app.get("/api/models", async (req, res) => {
  const ns: string | undefined = req.query.namespace as string;
  let models: any;
  if (ns) {
    models = await customApi.listNamespacedCustomObject({
      group: "kubeai.org",
      plural: "models",
      namespace: ns,
      version: "v1",
    });
  } else {
    models = await customApi.listCustomObjectForAllNamespaces({
      group: "kubeai.org",
      plural: "models",
      version: "v1",
    });
  }

  const parsedModels = (models.body as any).items.map((item: any) =>
    ModelSchema.parse(item)
  );

  res.send(parsedModels);
});

app.post("/api/models", async (req, res) => {
  const model = ModelSchema.parse(req.body);
  const namespace = model.metadata.namespace || "default";
  const name = model.metadata.name;

  if (!name) {
    const error: ErrorDto = {
      "metadata.name": ["Model metadata.name is required."],
    };
    return res.status(400).json(error);
  }

  try {
    const createdModel = await customApi.createNamespacedCustomObject({
      group: "kubeai.org",
      plural: "models",
      namespace: namespace,
      version: "v1",
      body: model,
    });
    res.status(201).json(createdModel.body);
  } catch (error: any) {
    if (error.statusCode === 409) {
      res.status(409).json({
        "": [`Model '${name}' already exists in namespace '${namespace}'.`],
      } as ErrorDto);
    } else {
      console.error("Error creating model:", error.message);
      const errorDto: ErrorDto = { "": ["Failed to create model."] };
      res.status(500).json(errorDto);
    }
  }
});
app.delete("/api/models/:name", async (req, res) => {
  const modelName = req.params.name;
  const namespace = (req.query.namespace as string) || "default";

  try {
    await customApi.deleteNamespacedCustomObject({
      group: "kubeai.org",
      plural: "models",
      namespace: namespace,
      version: "v1",
      name: modelName,
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({
        "": [`Model '${modelName}' not found in namespace '${namespace}'.`],
      } as ErrorDto);
    } else {
      console.error("Error deleting model:", error.message);
      const errorDto: ErrorDto = { "": ["Failed to delete model."] };
      res.status(500).json(errorDto);
    }
  }
});

app.put("/api/models/:name", async (req, res) => {
  const modelName = req.params.name;
  const namespace = (req.query.namespace as string) || "default";
  const model = ModelSchema.parse(req.body);

  if (modelName !== model.metadata.name) {
    return res.status(400).send("Model name in path and body do not match.");
  }
  if (namespace !== (model.metadata.namespace || "default")) {
    return res.status(400).send("Namespace in query and body do not match.");
  }

  try {
    const updatedModel = await customApi.replaceNamespacedCustomObject({
      group: "kubeai.org",
      plural: "models",
      namespace: namespace,
      version: "v1",
      name: modelName,
      body: model,
    });
    res.status(200).json(updatedModel.body);
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({
        "": [`Model '${modelName}' not found in namespace '${namespace}'.`],
      } as ErrorDto);
    } else {
      console.error("Error updating model:", error);
      res.status(500).json({ "": ["Failed to update model."] });
    }
  }
});

app.get("/public/api/openrouter/models", async (_, res) => {
  let models: any;
  try {
    models = await customApi.listCustomObjectForAllNamespaces({
      group: "kubeai.org",
      plural: "models",
      version: "v1",
    });
  } catch (error: any) {
    console.error("Error fetching models for OpenRouter:", error.message);
    return res.status(500).json({ error: "Failed to fetch models." });
  }

  const parsedModels = (models.body as any).items.map((item: any) =>
    ModelSchema.parse(item)
  );

  const openRouterModels = parsedModels.map((model: Model) => {
    const id = `${model.metadata.namespace}/${model.metadata.name}`;
    const name =
      model.metadata.annotations?.["openrouter.ai/name"] || model.metadata.name;
    const description =
      model.metadata.annotations?.["openrouter.ai/description"] ||
      `Model ${model.metadata.name} powered by ${model.spec.engine}`;
    const created = model.metadata.creationTimestamp
      ? Math.floor(new Date(model.metadata.creationTimestamp).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    const defaultPricing = {
      prompt: "0.000001",
      completion: "0.000002",
      image: "0",
      request: "0",
      input_cache_read: "0",
      input_cache_write: "0",
    };

    const inputModalities: string[] = ["text"];
    const outputModalities: string[] = ["text"];

    if (model.spec.features?.includes("SpeechToText")) {
      inputModalities.push("audio");
    }

    return {
      id: id,
      name: name,
      description: description,
      created: created,
      updated: created,
      pricing: {
        model: {
          unit: "USD",
          input: defaultPricing.prompt,
          output: defaultPricing.completion,
        },
        image: {
          unit: "USD",
          input: defaultPricing.image,
          output: defaultPricing.image,
        },
        request: {
          unit: "USD",
          input: defaultPricing.request,
          output: defaultPricing.request,
        },
        // Optional: Add cache pricing if applicable
        // input_cache_read: {
        //   unit: "USD",
        //   input: defaultPricing.input_cache_read,
        //   output: "0",
        // },
        // input_cache_write: {
        //   unit: "USD",
        //   input: defaultPricing.input_cache_write,
        //   output: "0",
        // },
      },
      context_window: 8192,
      max_tokens: 4096,
      top_provider: {
        id: model.spec.engine.toLowerCase(),
        name: model.spec.engine,
      },
      architecture: {
        modality: {
          input: inputModalities,
          output: outputModalities,
        },
        tokenizer: {
          // e.g., "openrouter.ai/tokenizer": "cl100k_base"
        },
      },
      per_request_limits: null,
      developer_url:
        model.metadata.annotations?.["openrouter.ai/developer_url"],
      homepage_url: model.metadata.annotations?.["openrouter.ai/homepage_url"],
      model_card_url:
        model.metadata.annotations?.["openrouter.ai/model_card_url"],
    };
  });

  res.json({ data: openRouterModels });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
