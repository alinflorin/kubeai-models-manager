import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Dropdown,
  Option,
  Checkbox,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModelSchema, type Model } from "../models/model";
import { z } from "zod";
import { useEffect } from "react";
import { createModel, updateModel } from "../services/models.service";
import useToast from "../hooks/useToast";

// Create a form schema based on ModelSchema but focused on editable fields
const ModelFormSchema = ModelSchema.pick({
  apiVersion: true,
  kind: true,
  metadata: true,
  spec: true,
}).extend({
  metadata: ModelSchema.shape.metadata.extend({
    name: z.string().min(1, "Name is required"),
    namespace: z.string().min(1, "Namespace is required"),
  }),
  spec: ModelSchema.shape.spec.extend({
    url: z.string().min(1, "URL is required"),
    engine: ModelSchema.shape.spec.shape.engine,
  }),
});

type ModelFormData = z.infer<typeof ModelFormSchema>;

const useStyles = makeStyles({
  form: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("1rem"),
    maxHeight: "70vh",
    overflowY: "auto",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("0.75rem"),
    ...shorthands.padding("1rem"),
    ...shorthands.border("1px", "solid", "var(--colorNeutralStroke2)"),
    ...shorthands.borderRadius("4px"),
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: "1rem",
    marginBottom: "0.5rem",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("1rem"),
  },
  arrayItem: {
    display: "flex",
    ...shorthands.gap("0.5rem"),
    alignItems: "flex-start",
  },
  arrayItemContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("0.5rem"),
  },
  envRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    ...shorthands.gap("0.5rem"),
    alignItems: "flex-start",
  },
});

type AddEditModelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model?: Model | null;
  namespace: string;
  onSuccess?: () => void;
};

export default function AddEditModel({
  open,
  onOpenChange,
  model,
  namespace,
  onSuccess,
}: AddEditModelProps) {
  const styles = useStyles();
  const showToast = useToast();
  const isEditMode = !!model;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ModelFormData>({
    resolver: zodResolver(ModelFormSchema),
    defaultValues: {
      apiVersion: "kubeai.org/v1",
      kind: "Model",
      metadata: {
        name: "",
        namespace: namespace,
      },
      spec: {
        url: "",
        engine: "OLlama",
        resourceProfile: "",
        cacheProfile: "",
        image: "",
      },
    },
  });

  console.log(errors);

  const {
    fields: adapterFields,
    append: appendAdapter,
    remove: removeAdapter,
  } = useFieldArray({
    control,
    name: "spec.adapters",
  });

  const argsFieldArray = useFieldArray({
    control,
    name: "spec.args" as any,
  });
  const argsFields = argsFieldArray.fields;
  const appendArgs = argsFieldArray.append as (value: string) => void;
  const removeArgs = argsFieldArray.remove;

  // Use useFieldArray for environment variables (key-value pairs)
  const {
    fields: envFields,
    append: appendEnv,
    remove: removeEnv,
  } = useFieldArray({
    control,
    name: "spec.env" as any,
  });

  // Use useFieldArray for annotations (key-value pairs)
  const {
    fields: annotationFields,
    append: appendAnnotation,
    remove: removeAnnotation,
  } = useFieldArray({
    control,
    name: "metadata.annotations" as any,
  });

  // Initialize form data when dialog opens
  useEffect(() => {
    if (!open) {
      return;
    }

    if (model) {
      // Edit mode: populate form with existing model data
      const modelEnv = model.spec.env || {};
      // Convert env record to array of key-value objects
      const envArray = Object.entries(modelEnv).map(([key, value]) => ({
        key,
        value: value || "",
      }));
      reset({
        apiVersion: model.apiVersion,
        kind: model.kind,
        metadata: {
          name: model.metadata.name || "",
          namespace: model.metadata.namespace || namespace,
          labels: model.metadata.labels,
          annotations: model.metadata.annotations,
        },
        spec: {
          url: model.spec.url,
          engine: model.spec.engine,
          features: model.spec.features || [],
          adapters: model.spec.adapters || [],
          resourceProfile: model.spec.resourceProfile,
          cacheProfile: model.spec.cacheProfile,
          image: model.spec.image,
          args: model.spec.args || [],
          env: envArray as any,
          envFrom: model.spec.envFrom,
          replicas: model.spec.replicas,
          minReplicas: model.spec.minReplicas,
          maxReplicas: model.spec.maxReplicas,
          autoscalingDisabled: model.spec.autoscalingDisabled,
          targetRequests: model.spec.targetRequests,
          scaleDownDelaySeconds: model.spec.scaleDownDelaySeconds,
          owner: model.spec.owner,
          loadBalancing: model.spec.loadBalancing,
          files: model.spec.files,
          priorityClassName: model.spec.priorityClassName,
        },
      });
    } else {
      // Create mode: reset to defaults
      reset({
        apiVersion: "kubeai.org/v1",
        kind: "Model",
        metadata: {
          name: "",
          namespace: namespace,
          annotations: {},
        },
        spec: {
          url: "",
          engine: "OLlama",
          resourceProfile: "",
          cacheProfile: "",
          image: "",
        },
      });
    }
  }, [open, model, namespace, reset]);

  const onSubmit = async (data: ModelFormData) => {
    console.log(data);
    try {
      // Convert env array back to record format
      const envArray = data.spec.env as any;
      const envRecord: Record<string, string> = {};
      if (Array.isArray(envArray)) {
        envArray.forEach((item: { key: string; value: string }) => {
          if (item?.key && item.key.trim()) {
            envRecord[item.key.trim()] = item.value || "";
          }
        });
      }

      // Convert annotations array back to record format
      const annotationsArray = data.metadata.annotations as any;
      const annotationsRecord: Record<string, string> = {};
      if (Array.isArray(annotationsArray)) {
        annotationsArray.forEach((item: { key: string; value: string }) => {
          if (item?.key && item.key.trim()) {
            annotationsRecord[item.key.trim()] = item.value || "";
          }
        });
      }

      const submitData: ModelFormData = {
        ...data,
        metadata: {
          ...data.metadata,
          annotations: annotationsRecord,
        },
        spec: {
          ...data.spec,
          env: envRecord,
        },
      };

      console.log(submitData);

      if (isEditMode && model?.metadata.name) {
        await updateModel(model.metadata.name, namespace, submitData);
        showToast("Model updated successfully", "success", "Success");
      } else {
        await createModel(submitData);
        showToast("Model created successfully", "success", "Success");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      showToast(
        `Failed to ${isEditMode ? "update" : "create"} model`,
        "error",
        "Error"
      );
      console.error(error);
    }
  };

  return (
    <Dialog modalType="modal" open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface style={{ maxWidth: "800px", width: "90vw" }}>
        <DialogBody>
          <DialogTitle>{isEditMode ? "Edit Model" : "Create Model"}</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              {/* Metadata Section */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Metadata</div>
                <div className={styles.row}>
                  <Controller
                    name="metadata.name"
                    control={control}
                    render={({ field }) => (
                      <Field
                        label="Name"
                        required
                        validationMessage={errors.metadata?.name?.message}
                      >
                        <Input
                          {...field}
                          disabled={isEditMode}
                          placeholder="model-name"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="metadata.namespace"
                    control={control}
                    render={({ field }) => (
                      <Field
                        label="Namespace"
                        required
                        validationMessage={errors.metadata?.namespace?.message}
                      >
                        <Input {...field} placeholder="default" readOnly />
                      </Field>
                    )}
                  />
                </div>
              </div>

              {/* Spec Section */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Specification</div>
                <Controller
                  name="spec.url"
                  control={control}
                  render={({ field }) => (
                    <Field
                      label="URL"
                      required
                      validationMessage={errors.spec?.url?.message}
                    >
                      <Input {...field} placeholder="https://example.com/model" />
                    </Field>
                  )}
                />
                <Controller
                  name="spec.engine"
                  control={control}
                  render={({ field }) => (
                    <Field
                      label="Engine"
                      required
                      validationMessage={errors.spec?.engine?.message}
                    >
                      <Dropdown
                        selectedOptions={[field.value]}
                        value={field.value}
                        onOptionSelect={(_, data) => {
                          if (data.optionValue) {
                            field.onChange(data.optionValue);
                          }
                        }}
                      >
                        <Option value="OLlama">OLlama</Option>
                        <Option value="VLLM">VLLM</Option>
                        <Option value="FasterWhisper">FasterWhisper</Option>
                        <Option value="Infinity">Infinity</Option>
                      </Dropdown>
                    </Field>
                  )}
                />
                <Controller
                  name="spec.features"
                  control={control}
                  render={({ field }) => (
                    <Field label="Features">
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {["TextGeneration", "TextEmbedding", "Reranking", "SpeechToText"].map(
                          (feature) => (
                            <Checkbox
                              key={feature}
                              label={feature}
                              checked={field.value?.includes(feature as any) || false}
                              onChange={(_, data) => {
                                const current = field.value || [];
                                if (data.checked) {
                                  field.onChange([...current, feature]);
                                } else {
                                  field.onChange(
                                    current.filter((f) => f !== feature)
                                  );
                                }
                              }}
                            />
                          )
                        )}
                      </div>
                    </Field>
                  )}
                />
                <div className={styles.row}>
                  <Controller
                    name="spec.resourceProfile"
                    control={control}
                    render={({ field }) => (
                      <Field label="Resource Profile">
                        <Input {...field} placeholder="default" />
                      </Field>
                    )}
                  />
                  <Controller
                    name="spec.cacheProfile"
                    control={control}
                    render={({ field }) => (
                      <Field label="Cache Profile">
                        <Input {...field} placeholder="default" />
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  name="spec.image"
                  control={control}
                  render={({ field }) => (
                    <Field label="Image">
                      <Input {...field} placeholder="docker.io/model:latest" />
                    </Field>
                  )}
                />
              </div>

              {/* Replicas Section */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Replicas & Scaling</div>
                <div className={styles.row}>
                  <Controller
                    name="spec.replicas"
                    control={control}
                    render={({ field }) => (
                      <Field label="Replicas">
                        <Input
                          {...field}
                          type="number"
                          value={field.value?.toString() || ""}
                          onChange={(_, data) =>
                            field.onChange(data.value ? parseInt(data.value, 10) : undefined)
                          }
                          placeholder="1"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="spec.autoscalingDisabled"
                    control={control}
                    render={({ field }) => (
                      <Field label=" ">
                        <Checkbox
                          label="Disable Autoscaling"
                          checked={field.value || false}
                          onChange={(_, data) => field.onChange(data.checked)}
                        />
                      </Field>
                    )}
                  />
                </div>
                <div className={styles.row}>
                  <Controller
                    name="spec.minReplicas"
                    control={control}
                    render={({ field }) => (
                      <Field label="Min Replicas">
                        <Input
                          {...field}
                          type="number"
                          value={field.value?.toString() || ""}
                          onChange={(_, data) =>
                            field.onChange(data.value ? parseInt(data.value, 10) : undefined)
                          }
                          placeholder="0"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="spec.maxReplicas"
                    control={control}
                    render={({ field }) => (
                      <Field label="Max Replicas">
                        <Input
                          {...field}
                          type="number"
                          value={field.value?.toString() || ""}
                          onChange={(_, data) =>
                            field.onChange(data.value ? parseInt(data.value, 10) : undefined)
                          }
                          placeholder="10"
                        />
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  name="spec.targetRequests"
                  control={control}
                  render={({ field }) => (
                    <Field label="Target Requests">
                      <Input
                        {...field}
                        type="number"
                        value={field.value?.toString() || ""}
                        onChange={(_, data) =>
                          field.onChange(data.value ? parseFloat(data.value) : undefined)
                        }
                        placeholder="100"
                      />
                    </Field>
                  )}
                />
              </div>

              {/* Adapters Section */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Adapters</div>
                {adapterFields.map((field, index) => (
                  <div key={field.id} className={styles.arrayItem}>
                    <div className={styles.arrayItemContent}>
                      <Controller
                        name={`spec.adapters.${index}.name`}
                        control={control}
                        render={({ field }) => (
                          <Field
                            label="Adapter Name"
                            validationMessage={
                              errors.spec?.adapters?.[index]?.name?.message
                            }
                          >
                            <Input {...field} placeholder="adapter-name" />
                          </Field>
                        )}
                      />
                      <Controller
                        name={`spec.adapters.${index}.url`}
                        control={control}
                        render={({ field }) => (
                          <Field label="Adapter URL">
                            <Input {...field} placeholder="https://example.com/adapter" />
                          </Field>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      appearance="subtle"
                      onClick={() => removeAdapter(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  appearance="secondary"
                  onClick={() => appendAdapter({ name: "", url: "" })}
                >
                  Add Adapter
                </Button>
              </div>

              {/* Environment Variables Section */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Environment Variables</div>
                {envFields.map((field, index) => (
                  <div key={field.id} className={styles.arrayItem}>
                    <div className={styles.arrayItemContent}>
                      <Controller
                        name={`spec.env.${index}.key` as any}
                        control={control}
                        render={({ field }) => (
                          <Field
                            label="Key"
                            validationMessage={
                              (errors.spec?.env as any)?.[index]?.key?.message as string | undefined
                            }
                          >
                            <Input {...field} placeholder="ENV_VAR_NAME" />
                          </Field>
                        )}
                      />
                      <Controller
                        name={`spec.env.${index}.value` as any}
                        control={control}
                        render={({ field }) => (
                          <Field label="Value">
                            <Input {...field} placeholder="value" />
                          </Field>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      appearance="subtle"
                      onClick={() => removeEnv(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  appearance="secondary"
                  onClick={() => appendEnv({ key: "", value: "" })}
                >
                  Add Environment Variable
                </Button>
              </div>

              {/* Args Section */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Arguments</div>
                {argsFields.map((field, index) => (
                  <div key={field.id} className={styles.arrayItem}>
                    <Controller
                      name={`spec.args.${index}`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="--arg=value" />
                      )}
                    />
                    <Button
                      type="button"
                      appearance="subtle"
                      onClick={() => removeArgs(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  appearance="secondary"
                  onClick={() => appendArgs("")}
                >
                  Add Argument
                </Button>
              </div>

              {/* Annotations Section */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Annotations</div>
                {annotationFields.map((field, index) => (
                  <div key={field.id} className={styles.arrayItem}>
                    <div className={styles.arrayItemContent}>
                      <Controller
                        name={`metadata.annotations.${index}.key` as any}
                        control={control}
                        render={({ field }) => (
                          <Field
                            label="Key"
                            validationMessage={
                              (errors.metadata?.annotations as any)?.[index]?.key?.message as string | undefined
                            }
                          >
                            <Input {...field} placeholder="annotation-key" />
                          </Field>
                        )}
                      />
                      <Controller
                        name={`metadata.annotations.${index}.value` as any}
                        control={control}
                        render={({ field }) => (
                          <Field label="Value">
                            <Input {...field} placeholder="value" />
                          </Field>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      appearance="subtle"
                      onClick={() => removeAnnotation(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  appearance="secondary"
                  onClick={() => appendAnnotation({ key: "", value: "" })}
                >
                  Add Annotation
                </Button>
              </div>

            </form>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button
                appearance="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update"
                : "Create"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
