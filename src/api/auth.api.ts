import { api } from './axios';
import { AuthResponse, RegisterResponse, User, Role } from '@/types';
import { endpoints } from './endpoints';

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post<AuthResponse>(endpoints.auth.login, credentials);
    return response.data;
  },

  register: async (data: { username: string; password: string }) => {
    const payload = { ...data, role: ('user' as Role) };
    const response = await api.post<RegisterResponse>(endpoints.auth.register, payload);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<User>(endpoints.auth.profile);
    return response.data;
  },
};
