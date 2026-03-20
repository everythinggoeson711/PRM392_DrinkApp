import { apiClient } from './client';
import type { Category } from '../types';

export const categoriesApi = {
  list: async () => {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<Category>(`/categories/${id}`);
    return data;
  },

  create: async (payload: Partial<Category>) => {
    const { data } = await apiClient.post<Category>('/categories', payload);
    return data;
  },

  update: async (id: number, payload: Partial<Category>) => {
    const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload);
    return data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/categories/${id}`);
  },
};
