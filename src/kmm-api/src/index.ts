import "dotenv/config";
import express from "express";
import { version } from "./version";
import errorHandler from "./middleware/error-handler";
import notFoundHandler from "./middleware/not-found-handler";
import * as k8s from "@kubernetes/client-node";
import { Model, ModelSchema } from "./models/model";
import { ErrorDto } from "./models/error-dto";
import { existsSync } from "fs"; // Keep existsSync for file system checks

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
  res.send(ns.items.map((x) => x.metadata!.name));
});

app.get("/api/models", async (req, res) => {
  let ns: string | undefined = req.query.namespace as string;
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
    // Kubernetes API returns the created object, which might have additional fields.
    // We can parse it again with our schema to ensure consistency if needed,
    // but for now, returning the body as is should be fine.
    // const parsedCreatedModel = ModelSchema.parse(createdModel.body);
    res.status(201).json(createdModel.body);
  } catch (error: any) {
    if (error.statusCode === 409) {
      res.status(409).json({
        "": [`Model '${name}' already exists in namespace '${namespace}'.`],
      });
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
    res.status(204).send(); // No Content
  } catch (error: any) {
    // Catch any error during the delete operation
    if (error.statusCode === 404) {
      res.status(404).json({
        "": [`Model '${modelName}' not found in namespace '${namespace}'.`],
      });
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
      });
    } else {
      console.error("Error updating model:", error);
      res.status(500).json({ "": ["Failed to update model."] });
    }
  }
});

app.get("/api/openrouter/models", async (req, res) => {
  // For OpenRouter, we need to list all models available on the platform.
  // This means fetching models across all namespaces.
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

  // Transform KMM models into OpenRouter's expected format
  const openRouterModels = parsedModels.map((model: Model) => {
    const id = `${model.metadata.namespace}/${model.metadata.name}`;
    const name = model.metadata.annotations?.["openrouter.ai/name"] || model.metadata.name;
    const description = model.metadata.annotations?.["openrouter.ai/description"] || `Model ${model.metadata.name} powered by ${model.spec.engine}`;
    const created = model.metadata.creationTimestamp ? Math.floor(new Date(model.metadata.creationTimestamp).getTime() / 1000) : Math.floor(Date.now() / 1000); // Unix timestamp

    // Default pricing (can be customized via annotations if needed)
    const defaultPricing = {
      prompt: "0.000001", // Example default, adjust as necessary
      completion: "0.000002", // Example default, adjust as necessary
      image: "0",
      request: "0",
      input_cache_read: "0",
      input_cache_write: "0",
    };

    // Input/Output modalities based on features
    const inputModalities: string[] = ["text"]; // Default
    const outputModalities: string[] = ["text"]; // Default

    if (model.spec.features?.includes("SpeechToText")) {
      inputModalities.push("audio");
    }

    return {
      id: id,
      name: name,
      description: description,
      created: created,
      updated: created, // Assuming updated is same as created if not explicitly available
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
      context_window: 8192, // Example default, can be customized via annotations
      max_tokens: 4096, // Example default, can be customized via annotations
      top_provider: {
        id: model.spec.engine.toLowerCase(), // Use engine as provider ID
        name: model.spec.engine,
      },
      architecture: {
        modality: {
          input: inputModalities,
          output: outputModalities,
        },
        tokenizer: {
          // Can be customized via annotations
          // e.g., "openrouter.ai/tokenizer": "cl100k_base"
        },
      },
      per_request_limits: null, // Or specific limits if available
      developer_url: model.metadata.annotations?.["openrouter.ai/developer_url"],
      homepage_url: model.metadata.annotations?.["openrouter.ai/homepage_url"],
      model_card_url: model.metadata.annotations?.["openrouter.ai/model_card_url"],
    };
  });

  res.json({ data: openRouterModels });
});

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
