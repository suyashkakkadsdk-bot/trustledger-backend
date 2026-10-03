/**
 * TrustLedger PS-12 - Strict Data Types
 * Backend-locked and synchronized with backend API schemas.
 */

export interface CertificateInput {
  name: string;
  course: string;
  organization: string;
  date: string;
  issuer_id?: string;
}

export interface DonationInput {
  name: string;
  amount: number;
  organization: string;
  purpose: string;
  date: string;
  issuer_id?: string;
}

export interface CertificateData {
  name: string;
  course: string;
  organization: string;
  date: string;
  issuer_id: string;
  [key: string]: any;
}

export interface DonationData {
  name: string;
  amount: number;
  organization: string;
  purpose: string;
  date: string;
  issuer_id: string;
  [key: string]: any;
}

export interface LedgerRecord {
  id: string;
  type: 'certificate' | 'donation';
  status: 'VERIFIED' | 'TAMPER_DETECTED';
  hash: string;
  issuer_id: string;
  created_at: string;
  updated_at?: string;
  record_data: CertificateData | DonationData;
  verification_url: string;
}

export interface VerificationResult {
  id: string;
  type: 'certificate' | 'donation';
  status: 'VERIFIED' | 'TAMPER_DETECTED';
  verified: boolean;
  tampered: boolean;
  hash: string;
  computed_hash: string;
  issuer_id: string;
  created_at: string;
  verified_at: string;
  record_data: Record<string, any>;
  verification_url: string;
  message?: string;
}

export interface AuditEvent {
  id: string;
  event: 'Created' | 'Updated' | 'Verified' | 'Tamper Detected';
  timestamp: string;
  actor: string;
  details: string;
}

export interface AuditResponse {
  id: string;
  type: 'certificate' | 'donation';
  current_status: 'VERIFIED' | 'TAMPER_DETECTED';
  audit_trail: AuditEvent[];
}

export interface ApiErrorResponse {
  error: string;
  status?: string;
  verified?: boolean;
}
