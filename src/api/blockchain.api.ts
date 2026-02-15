import { api } from './axios';
import { BlockchainVerification } from '@/types';
import { endpoints } from './endpoints';

export const blockchainApi = {
  verifyCertificate: async (certificateId: string) => {
    const response = await api.get<BlockchainVerification>(endpoints.blockchain.verify(certificateId));
    return response.data;
  },

  getTransactionDetails: async (txHash: string) => {
    const response = await api.get<{ status: string; blockHeight: number }>(endpoints.blockchain.tx(txHash));
    return response.data;
  },
};
