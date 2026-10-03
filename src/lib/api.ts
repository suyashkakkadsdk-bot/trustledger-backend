/**
 * Centralized API client for TrustLedger PS-12
 * Connects frontend forms to backend endpoints without inventing contracts.
 */

import type {
  CertificateInput,
  DonationInput,
  LedgerRecord,
  VerificationResult,
  AuditResponse,
} from '../types/ledger';

// Priority: VITE_API_BASE_URL -> NEXT_PUBLIC_API_BASE_URL -> window.location.origin -> fallback ''
function getApiBaseUrl(): string {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    // @ts-ignore
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) {
    // @ts-ignore
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '');
  }
  return '';
}

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new ApiError(
      `Network connection failure: unable to communicate with backend at ${url}. ${netErr.message || ''}`,
      0
    );
  }

  let json: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      json = await response.json();
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    const errorMsg = json?.error || json?.message || `Request failed with status ${response.status} (${response.statusText})`;
    throw new ApiError(errorMsg, response.status, json);
  }

  return json as T;
}

/**
 * Creates an immutable certificate record in the ledger.
 */
export async function createCertificate(input: CertificateInput): Promise<LedgerRecord> {
  return request<LedgerRecord>('/api/certificates', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      course: input.course,
      organization: input.organization,
      date: input.date,
      ...(input.issuer_id ? { issuer_id: input.issuer_id } : {}),
    }),
  });
}

/**
 * Creates an immutable donation record in the ledger.
 */
export async function createDonation(input: DonationInput): Promise<LedgerRecord> {
  return request<LedgerRecord>('/api/donations', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      amount: Number(input.amount),
      organization: input.organization,
      purpose: input.purpose,
      date: input.date,
      ...(input.issuer_id ? { issuer_id: input.issuer_id } : {}),
    }),
  });
}

/**
 * Queries the cryptographic verification status of a record by ID.
 * Backend recalculates current SHA-256 hash vs original anchored hash.
 */
export async function verifyRecord(id: string): Promise<VerificationResult> {
  const cleanId = encodeURIComponent(id.trim());
  return request<VerificationResult>(`/api/verify/${cleanId}`, {
    method: 'GET',
  });
}

/**
 * Retrieves the cryptographic audit trail for a record.
 */
export async function getAuditHistory(id: string): Promise<AuditResponse> {
  const cleanId = encodeURIComponent(id.trim());
  return request<AuditResponse>(`/api/audit/${cleanId}`, {
    method: 'GET',
  });
}

/**
 * Retrieves all registered records from the ledger.
 */
export async function listRecords(): Promise<LedgerRecord[]> {
  return request<LedgerRecord[]>('/api/records', {
    method: 'GET',
  });
}

/**
 * Simulates real out-of-band tampering with stored record in the backend database.
 * Used for live audit demonstrations.
 */
export async function tamperRecord(
  id: string,
  options?: { field?: string; value?: string | number }
): Promise<any> {
  const cleanId = encodeURIComponent(id.trim());
  return request<any>(`/api/records/${cleanId}/tamper`, {
    method: 'POST',
    body: JSON.stringify(options || {}),
  });
}

/**
 * Restores original authenticated data for a record.
 */
export async function restoreRecord(id: string): Promise<any> {
  const cleanId = encodeURIComponent(id.trim());
  return request<any>(`/api/records/${cleanId}/restore`, {
    method: 'POST',
  });
}
