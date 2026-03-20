import { apiClient } from './client';
import type { Order } from '../types';

export const ordersApi = {
  list: async (userId?: number) => {
    const params = userId ? { userId } : undefined;
    const { data } = await apiClient.get<Order[]>('/orders', { params });
    return data;
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  },

  updateStatus: async (id: number, status: string) => {
    const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },
};
