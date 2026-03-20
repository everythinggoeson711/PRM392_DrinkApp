import { apiClient, TOKEN_KEY, USER_KEY } from './client';
import type { User } from '../types';

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post<any>('/auth/login', {
      email,
      password,
    });
    // Backend on Railway might return access_token instead of accessToken
    const token = data.accessToken || data.access_token;
    localStorage.setItem(TOKEN_KEY, token);
    
    // Now that we have the token, we must fetch the profile
    const userProfile = await authApi.profile();
    localStorage.setItem(USER_KEY, JSON.stringify(userProfile));

    return { accessToken: token, user: userProfile };
  },

  profile: async () => {
    const { data } = await apiClient.get<User>('/auth/profile');
    return data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
