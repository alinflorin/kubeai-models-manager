import {
  Body1,
  Button,
  Card,
  CardFooter,
  CardHeader,
  Dropdown,
  Field,
  Option,
  Spinner,
  Subtitle1,
  Title1,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import { useEffect, useState } from 'react';
import { getNamespaces } from '../services/namespaces.service';
import { type Model, ModelSchema } from '../models/model';
import { getModels } from '../services/models.service';
import useToast from '../hooks/useToast';
import { DeleteRegular, EditRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('1rem'),
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    ...shorthands.gap('1rem'),
  },
  cardFooter: {
    justifyContent: 'flex-end',
  },
});

export default function ModelsList() {
  const styles = useStyles();
  const [namespaces, setNamespaces] = useState<string[]>(["default"]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>("default");
  const [isLoadingNamespaces, setIsLoadingNamespaces] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    const fetchNamespaces = async () => {
      setIsLoadingNamespaces(true);
      try {
        const data = await getNamespaces();
        setNamespaces(data);
      } catch (err) {
        showToast('Failed to fetch namespaces.', 'error', 'Error');
        console.error(err);
      } finally {
        setIsLoadingNamespaces(false);
      }
    };
    fetchNamespaces();
  }, [showToast]);

  useEffect(() => {
    if (!selectedNamespace) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const data = await getModels(selectedNamespace);
        const validatedData = data.filter((item) => {
          const parsed = ModelSchema.safeParse(item);
          if (!parsed.success) {
            console.warn('Invalid model data received:', item, parsed.error);
          }
          return parsed.success;
        });
        setModels(validatedData);
      } catch (err) {
        showToast(`Failed to fetch models for namespace "${selectedNamespace}".`, 'error', 'Error');
        console.error(err);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [selectedNamespace, showToast]);

  return (
    <div className={styles.container}>
      <Title1 as="h1">Models</Title1>
      <Field label="Namespace" style={{ maxWidth: '300px' }}>
        <Dropdown
          selectedOptions={[selectedNamespace]}
          value={selectedNamespace}
          onOptionSelect={(_, data) => setSelectedNamespace(data.optionValue!)}
          disabled={isLoadingNamespaces || namespaces.length === 0}
        >
          {isLoadingNamespaces && <Option key="loading">Loading...</Option>}
          {namespaces.map((ns) => (
            <Option key={ns} value={ns}>
              {ns}
            </Option>
          ))}
        </Dropdown>
      </Field>

      {isLoadingModels && <Spinner label="Loading models..." />}

      {!isLoadingModels && models.length === 0 && selectedNamespace && (
        <Body1>No models found in the "{selectedNamespace}" namespace.</Body1>
      )}

      <div className={styles.cards}>
        {models.map((model) => (
          <Card key={model.metadata.uid}>
            <CardHeader header={<Subtitle1>{model.metadata.name}</Subtitle1>} />
            <Body1>
              <strong>Engine:</strong> {model.spec.engine}
            </Body1>
            <Body1>
              <strong>URL:</strong> {model.spec.url}
            </Body1>
            <CardFooter className={styles.cardFooter}>
              <Button appearance='subtle' icon={<EditRegular />}>Edit</Button>
              <Button appearance='subtle' icon={<DeleteRegular />}>Delete</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}