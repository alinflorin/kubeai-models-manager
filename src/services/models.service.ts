import axios from 'axios';
import { type Model } from '../models/model';

const API_URL = '/api/models';

export const getModels = async (namespace?: string): Promise<Model[]> => {
  const response = await axios.get(API_URL, { params: { namespace } });
  return response.data;
};

export const createModel = async (model: Model): Promise<Model> => {
  const response = await axios.post(API_URL, model);
  return response.data;
};

export const updateModel = async (name: string, namespace: string, model: Model): Promise<Model> => {
  const response = await axios.put(`${API_URL}/${name}`, model, { params: { namespace } });
  return response.data;
};

export const deleteModel = async (name: string, namespace: string): Promise<void> => {
  await axios.delete(`${API_URL}/${name}`, { params: { namespace } });
};
