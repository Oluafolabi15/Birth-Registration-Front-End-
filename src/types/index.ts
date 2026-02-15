export type Role = 'user' | 'admin' | 'registrar';

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface AuthResponse {
  access_token: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  role: string;
}

export interface BirthRecord {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE';
  place_of_birth: string;
  mother_full_name: string;
  father_full_name: string;
  status?: string;
  hash?: string;
  blockchainTx?: string;
  user?: User;
  certificates?: Certificate[];
  transactions?: unknown[];
}

export interface CreateBirthRecordDTO {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE';
  place_of_birth: string;
  mother_full_name: string;
  father_full_name: string;
}

export interface Certificate {
  id: number;
  certificateNumber: string;
  issuedAt: string;
  pdfUrl?: string;
  blockchainTx?: string;
  first_name: string;
  birthRecord?: number | BirthRecord; 
  isVerified?: boolean; 
}

export interface BlockchainVerification {
  isValid: boolean;
  timestamp: string;
  blockNumber: number;
  transactionHash: string;
}
