import { api } from './axios';
import { User } from '@/types';
import { endpoints } from './endpoints';

export const userApi = {
  getAllUsers: async () => {
    const response = await api.get<User[]>(endpoints.users.root);
    return response.data;
  },

  getUser: async (id: number | string) => {
    const response = await api.get<User>(endpoints.users.byId(id));
    return response.data;
  },

  deleteUser: async (id: string) => {
    await api.delete(endpoints.users.byId(id));
  },
};
