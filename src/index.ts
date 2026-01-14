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

app.listen(3000, () =>
  console.log("Server is listening on port 3000...")
);
