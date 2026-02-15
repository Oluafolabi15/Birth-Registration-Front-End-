import { api } from './axios';
import { BirthRecord, CreateBirthRecordDTO } from '@/types';
import { endpoints } from './endpoints';

export const birthApi = {
  createRecord: async (data: CreateBirthRecordDTO) => {
    const response = await api.post<BirthRecord>(endpoints.birthRecords.root, data);
    return response.data;
  },

  getMyRecords: async () => {
    const response = await api.get<BirthRecord[]>(endpoints.birthRecords.myRecords);
    return response.data;
  },

  getAllRecords: async () => {
    const paths = [
      endpoints.birthRecords.myRecords,
      endpoints.birthRecords.root,
      endpoints.birthRecords.adminRoot,
    ];
    let lastError: unknown = null;
    for (const path of paths) {
      try {
        const response = await api.get<BirthRecord[]>(path);
        if (Array.isArray(response.data)) {
          return response.data;
        }
      } catch (error) {
        lastError = error;
      }
    }
    return [];
  },

  getRecordById: async (id: string) => {
    const response = await api.get<BirthRecord>(endpoints.birthRecords.byId(id));
    return response.data;
  },

  updateStatus: async (id: string, status: BirthRecord['status']) => {
    const normalized = (status ?? '').toString().toUpperCase();
    if (normalized === 'VERIFIED') {
      const response = await api.patch<BirthRecord>(endpoints.birthRecords.verify(id), {});
      return response.data;
    }
    if (normalized === 'REJECTED') {
      const response = await api.patch<BirthRecord>(endpoints.birthRecords.reject(id), {});
      return response.data;
    }
    throw new Error(`Unsupported status "${status}". Use VERIFIED or REJECTED.`);
  },
};
