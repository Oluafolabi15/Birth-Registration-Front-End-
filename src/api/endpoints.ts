export const endpoints = {
  auth: {
    register: `/auth/register`,
    login: `/auth/login`,
    profile: `/auth/profile`,
  },
  birthRecords: {
    root: `/birth-records`,
    myRecords: `/birth-records/my-records`,
    byId: (id: string | number) => `/birth-records/${id}`,
    verify: (id: string | number) => `/birth-records/${id}/verify`,
    reject: (id: string | number) => `/birth-records/${id}/reject`,
    adminRoot: `/admin/birth-records`,
  },
  certificates: {
    root: `/certificates`,
    byId: (id: string | number) => `/certificates/${id}`,
  },
  blockchain: {
    verify: (certificateId: string | number) => `/blockchain/verify/${certificateId}`,
    tx: (txHash: string) => `/blockchain/tx/${txHash}`,
  },
  users: {
    root: `/users`,
    byId: (id: string | number) => `/users/${id}`,
  },
} as const;
