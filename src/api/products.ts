import { apiClient } from './client';
import type { Product } from '../types';

export const productsApi = {
  list: async (query?: { search?: string; categoryId?: number }) => {
    const { data } = await apiClient.get<Product[]>('/products', { params: query });
    return data;
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  create: async (payload: Partial<Product>) => {
    const { data } = await apiClient.post<Product>('/products', payload);
    return data;
  },

  update: async (id: number, payload: Partial<Product>) => {
    const { data } = await apiClient.patch<Product>(`/products/${id}`, payload);
    return data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/products/${id}`);
  },

  uploadImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await apiClient.patch<Product>(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
