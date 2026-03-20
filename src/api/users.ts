import { apiClient } from './client';
import type { User } from '../types';

export const usersApi = {
  list: async () => {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  create: async (payload: Partial<User>) => {
    const { data } = await apiClient.post<User>('/users', payload);
    return data;
  },

  update: async (id: number, payload: Partial<User>) => {
    const { data } = await apiClient.patch<User>(`/users/${id}`, payload);
    return data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/users/${id}`);
  },
};
