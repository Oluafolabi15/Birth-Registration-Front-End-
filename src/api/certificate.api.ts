import { api } from './axios';
import { Certificate } from '@/types';
import { endpoints } from './endpoints';

export const certificateApi = {
  generateCertificate: async (recordId: string) => {
    const response = await api.post<Certificate>(endpoints.certificates.root, { recordId });
    return response.data;
  },

  getMyCertificates: async () => {
    const response = await api.get<Certificate[]>(endpoints.certificates.root);
    return response.data;
  },

  getAllCertificates: async () => {
    const response = await api.get<Certificate[]>(endpoints.certificates.root);
    return response.data;
  },

  getCertificateById: async (id: string) => {
    const response = await api.get<Certificate>(endpoints.certificates.byId(id));
    return response.data;
  },

  deleteCertificate: async (id: string) => {
    await api.delete(endpoints.certificates.byId(id));
  },
};
