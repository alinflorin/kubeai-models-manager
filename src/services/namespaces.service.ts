import axios from 'axios';

const NAMESPACES_API_URL = '/api/namespaces';

export const getNamespaces = async (): Promise<string[]> => {
  const response = await axios.get<string[]>(NAMESPACES_API_URL);
  return response.data;
};

