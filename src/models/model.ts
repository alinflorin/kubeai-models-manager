import { z } from 'zod';

// --- Helper Schemas ---

export const ObjectMetaSchema = z.object({
  name: z.string().optional(),
  namespace: z.string().optional(),
  // Zod records: .record(ValueType) or .record(KeyType, ValueType)
  labels: z.record(z.string(), z.string()).optional(),
  annotations: z.record(z.string(), z.string()).optional(),
  uid: z.string().optional(),
  resourceVersion: z.string().optional(),
  creationTimestamp: z.string().optional(),
});

export const AdapterSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
});

export const FileSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export const EnvFromSourceSchema = z.object({
  prefix: z.string().optional(),
  configMapRef: z.object({
    name: z.string().optional(),
    optional: z.boolean().optional(),
  }).optional(),
  secretRef: z.object({
    name: z.string().optional(),
    optional: z.boolean().optional(),
  }).optional(),
});

export const PrefixHashSchema = z.object({
  meanLoadFactor: z.number().optional(),
  replication: z.number().int().optional(),
  prefixCharLength: z.number().int().optional(),
});

export const LoadBalancingSchema = z.object({
  strategy: z.enum(["LeastLoad", "PrefixHash"]).optional(),
  prefixHash: PrefixHashSchema.optional(),
});

// --- Main Spec Schema ---

export const ModelSpecSchema = z.object({
  url: z.string(),
  adapters: z.array(AdapterSchema).optional(),
  features: z.array(z.enum(["TextGeneration", "TextEmbedding", "Reranking", "SpeechToText"])).optional(),
  engine: z.enum(["OLlama", "VLLM", "FasterWhisper", "Infinity"]),
  resourceProfile: z.string().optional(),
  cacheProfile: z.string().optional(),
  image: z.string().optional(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(), // Maps to {[key: string]: string}
  envFrom: z.array(EnvFromSourceSchema).optional(),
  replicas: z.number().int().min(0).optional(),
  minReplicas: z.number().int().min(0).optional(),
  maxReplicas: z.number().int().min(0).optional(),
  autoscalingDisabled: z.boolean().optional(),
  targetRequests: z.number().optional(),
  scaleDownDelaySeconds: z.number().int().optional(),
  owner: z.string().optional(),
  loadBalancing: LoadBalancingSchema.optional(),
  files: z.array(FileSchema).optional(),
  priorityClassName: z.string().optional(),
});

// --- Root Model Schema ---

export const ModelSchema = z.object({
  apiVersion: z.literal("kubeai.org/v1"),
  kind: z.literal("Model"),
  metadata: ObjectMetaSchema,
  spec: ModelSpecSchema,
  status: z.object({
    replicas: z.object({
      all: z.number().int().optional(),
      ready: z.number().int().optional(),
    }).optional(),
    cache: z.object({
      loaded: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

// Extract the Type from the Schema
export type Model = z.infer<typeof ModelSchema>;