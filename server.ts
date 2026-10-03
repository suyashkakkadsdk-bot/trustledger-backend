import express, { Request, Response } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(express.json());

// Ledger Record Types
export interface AuditLogItem {
  id: string;
  event: 'Created' | 'Updated' | 'Verified' | 'Tamper Detected';
  timestamp: string;
  actor: string;
  details: string;
}

export interface StoredRecord {
  id: string;
  type: 'certificate' | 'donation';
  data: Record<string, any>;
  original_data_backup: Record<string, any>;
  hash: string;
  issuer_id: string;
  created_at: string;
  updated_at: string;
  audit_trail: AuditLogItem[];
}

// In-Memory & File Ledger Persistence
const LEDGER_FILE_PATH = path.resolve(__dirname, '.ledger_store.json');
let ledgerRecords: Map<string, StoredRecord> = new Map();

function saveLedger() {
  try {
    const list = Array.from(ledgerRecords.values());
    fs.writeFileSync(LEDGER_FILE_PATH, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist ledger to disk:', err);
  }
}

function loadLedger() {
  try {
    if (fs.existsSync(LEDGER_FILE_PATH)) {
      const raw = fs.readFileSync(LEDGER_FILE_PATH, 'utf8');
      const list: StoredRecord[] = JSON.parse(raw);
      ledgerRecords.clear();
      for (const rec of list) {
        ledgerRecords.set(rec.id, rec);
      }
      console.log(`Loaded ${ledgerRecords.size} records from ledger storage.`);
    }
  } catch (err) {
    console.error('Failed to load ledger from disk:', err);
  }
}

loadLedger();

// Deterministic Canonical Hash Calculator
export function calculateCanonicalHash(data: Record<string, any>): string {
  // Sort keys alphabetically for strictly deterministic canonical representation
  const sortedKeys = Object.keys(data).sort();
  const canonicalObj: Record<string, any> = {};
  for (const k of sortedKeys) {
    canonicalObj[k] = data[k];
  }
  const canonicalString = JSON.stringify(canonicalObj);
  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

// Helper to determine base URL
function getBaseUrl(req: Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = req.get('host') || `localhost:${PORT}`;
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

// ----------------------------------------------------
// BACKEND API ROUTES
// ----------------------------------------------------

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'TrustLedger PS-12 Core Integrity Engine',
    timestamp: new Date().toISOString(),
    total_records: ledgerRecords.size,
  });
});

// POST /api/certificates
app.post('/api/certificates', (req: Request, res: Response) => {
  try {
    const { name, course, organization, date, issuer_id } = req.body;

    // Strict validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Validation failed: "name" is required and must be a non-empty string.' });
      return;
    }
    if (!course || typeof course !== 'string' || !course.trim()) {
      res.status(400).json({ error: 'Validation failed: "course" is required and must be a non-empty string.' });
      return;
    }
    if (!organization || typeof organization !== 'string' || !organization.trim()) {
      res.status(400).json({ error: 'Validation failed: "organization" is required and must be a non-empty string.' });
      return;
    }
    if (!date || typeof date !== 'string' || !date.trim()) {
      res.status(400).json({ error: 'Validation failed: "date" is required and must be a non-empty string.' });
      return;
    }

    const assignedIssuer = issuer_id && typeof issuer_id === 'string' && issuer_id.trim()
      ? issuer_id.trim()
      : 'TL-ISSUER-AUTHORITY-01';

    const certificateData = {
      name: name.trim(),
      course: course.trim(),
      organization: organization.trim(),
      date: date.trim(),
      issuer_id: assignedIssuer,
    };

    // Calculate cryptographic SHA-256 hash
    const computedHash = calculateCanonicalHash(certificateData);
    
    // Generate authoritative Record ID
    const shortEntropy = crypto.randomBytes(4).toString('hex').toUpperCase();
    const recordId = `CERT-${shortEntropy}`;
    const timestamp = new Date().toISOString();
    const baseUrl = getBaseUrl(req);
    const verificationUrl = `${baseUrl}/verify/${recordId}`;

    const newRecord: StoredRecord = {
      id: recordId,
      type: 'certificate',
      data: certificateData,
      original_data_backup: { ...certificateData },
      hash: computedHash,
      issuer_id: assignedIssuer,
      created_at: timestamp,
      updated_at: timestamp,
      audit_trail: [
        {
          id: `aud-${crypto.randomBytes(3).toString('hex')}`,
          event: 'Created',
          timestamp,
          actor: `Issuer (${assignedIssuer})`,
          details: `Cryptographic certificate created with SHA-256 fingerprint ${computedHash.slice(0, 16)}...`,
        },
      ],
    };

    ledgerRecords.set(recordId, newRecord);
    saveLedger();

    // Actual Backend Response
    res.status(201).json({
      id: newRecord.id,
      type: newRecord.type,
      status: 'VERIFIED',
      hash: newRecord.hash,
      issuer_id: newRecord.issuer_id,
      created_at: newRecord.created_at,
      record_data: newRecord.data,
      verification_url: verificationUrl,
    });
  } catch (error: any) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ error: 'Internal server error while anchoring certificate.' });
  }
});

// POST /api/donations
app.post('/api/donations', (req: Request, res: Response) => {
  try {
    const { name, amount, organization, purpose, date, issuer_id } = req.body;

    // Strict validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Validation failed: "name" is required and must be a non-empty string.' });
      return;
    }
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      res.status(400).json({ error: 'Validation failed: "amount" is required and must be a positive number.' });
      return;
    }
    if (!organization || typeof organization !== 'string' || !organization.trim()) {
      res.status(400).json({ error: 'Validation failed: "organization" is required and must be a non-empty string.' });
      return;
    }
    if (!purpose || typeof purpose !== 'string' || !purpose.trim()) {
      res.status(400).json({ error: 'Validation failed: "purpose" is required and must be a non-empty string.' });
      return;
    }
    if (!date || typeof date !== 'string' || !date.trim()) {
      res.status(400).json({ error: 'Validation failed: "date" is required and must be a non-empty string.' });
      return;
    }

    const assignedIssuer = issuer_id && typeof issuer_id === 'string' && issuer_id.trim()
      ? issuer_id.trim()
      : 'TL-DONATION-REGISTRAR-02';

    const donationData = {
      name: name.trim(),
      amount: Number(amount),
      organization: organization.trim(),
      purpose: purpose.trim(),
      date: date.trim(),
      issuer_id: assignedIssuer,
    };

    // Calculate cryptographic SHA-256 hash
    const computedHash = calculateCanonicalHash(donationData);

    // Generate authoritative Record ID
    const shortEntropy = crypto.randomBytes(4).toString('hex').toUpperCase();
    const recordId = `DON-${shortEntropy}`;
    const timestamp = new Date().toISOString();
    const baseUrl = getBaseUrl(req);
    const verificationUrl = `${baseUrl}/verify/${recordId}`;

    const newRecord: StoredRecord = {
      id: recordId,
      type: 'donation',
      data: donationData,
      original_data_backup: { ...donationData },
      hash: computedHash,
      issuer_id: assignedIssuer,
      created_at: timestamp,
      updated_at: timestamp,
      audit_trail: [
        {
          id: `aud-${crypto.randomBytes(3).toString('hex')}`,
          event: 'Created',
          timestamp,
          actor: `Issuer (${assignedIssuer})`,
          details: `Cryptographic donation receipt anchored with SHA-256 fingerprint ${computedHash.slice(0, 16)}...`,
        },
      ],
    };

    ledgerRecords.set(recordId, newRecord);
    saveLedger();

    // Actual Backend Response
    res.status(201).json({
      id: newRecord.id,
      type: newRecord.type,
      status: 'VERIFIED',
      hash: newRecord.hash,
      issuer_id: newRecord.issuer_id,
      created_at: newRecord.created_at,
      record_data: newRecord.data,
      verification_url: verificationUrl,
    });
  } catch (error: any) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Internal server error while anchoring donation.' });
  }
});

// GET /api/verify/:id
app.get('/api/verify/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const record = ledgerRecords.get(id);

  if (!record) {
    res.status(404).json({
      error: `Record "${id}" not found in cryptographic ledger.`,
      status: 'NOT_FOUND',
      verified: false,
    });
    return;
  }

  // Recalculate hash of current data in storage
  const currentComputedHash = calculateCanonicalHash(record.data);
  const isValid = currentComputedHash === record.hash;
  const verifiedAt = new Date().toISOString();
  const baseUrl = getBaseUrl(req);

  if (isValid) {
    // Audit verified event
    record.audit_trail.push({
      id: `aud-${crypto.randomBytes(3).toString('hex')}`,
      event: 'Verified',
      timestamp: verifiedAt,
      actor: 'Public Verifier',
      details: 'Integrity verified. Cryptographic checksum matches original anchor.',
    });
    saveLedger();

    res.json({
      id: record.id,
      type: record.type,
      status: 'VERIFIED',
      verified: true,
      tampered: false,
      hash: record.hash,
      computed_hash: currentComputedHash,
      issuer_id: record.issuer_id,
      created_at: record.created_at,
      verified_at: verifiedAt,
      record_data: record.data,
      verification_url: `${baseUrl}/verify/${record.id}`,
    });
  } else {
    // Tamper detected event
    record.audit_trail.push({
      id: `aud-${crypto.randomBytes(3).toString('hex')}`,
      event: 'Tamper Detected',
      timestamp: verifiedAt,
      actor: 'Public Verifier / Security Engine',
      details: `Integrity violation! Stored checksum (${currentComputedHash.slice(0, 16)}...) mismatches anchored fingerprint (${record.hash.slice(0, 16)}...).`,
    });
    saveLedger();

    res.json({
      id: record.id,
      type: record.type,
      status: 'TAMPER_DETECTED',
      verified: false,
      tampered: true,
      hash: record.hash,
      computed_hash: currentComputedHash,
      issuer_id: record.issuer_id,
      created_at: record.created_at,
      verified_at: verifiedAt,
      record_data: record.data,
      verification_url: `${baseUrl}/verify/${record.id}`,
      message: 'The stored record no longer matches its original integrity fingerprint.',
    });
  }
});

// GET /api/audit/:id
app.get('/api/audit/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const record = ledgerRecords.get(id);

  if (!record) {
    res.status(404).json({
      error: `Record "${id}" not found in cryptographic audit registry.`,
      status: 'NOT_FOUND',
    });
    return;
  }

  const currentComputedHash = calculateCanonicalHash(record.data);
  const status = currentComputedHash === record.hash ? 'VERIFIED' : 'TAMPER_DETECTED';

  res.json({
    id: record.id,
    type: record.type,
    current_status: status,
    audit_trail: record.audit_trail,
  });
});

// GET /api/records - List all authoritative ledger records
app.get('/api/records', (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);
  const list = Array.from(ledgerRecords.values()).map((r) => {
    const computed = calculateCanonicalHash(r.data);
    const status = computed === r.hash ? 'VERIFIED' : 'TAMPER_DETECTED';
    return {
      id: r.id,
      type: r.type,
      status,
      hash: r.hash,
      issuer_id: r.issuer_id,
      created_at: r.created_at,
      updated_at: r.updated_at,
      record_data: r.data,
      verification_url: `${baseUrl}/verify/${r.id}`,
    };
  });

  // Sort newest first
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(list);
});

// POST /api/records/:id/tamper - Real tamper testing endpoint
// Directly mutates the underlying record data without updating the authoritative anchor hash
app.post('/api/records/:id/tamper', (req: Request, res: Response) => {
  const { id } = req.params;
  const record = ledgerRecords.get(id);

  if (!record) {
    res.status(404).json({ error: `Record "${id}" not found.` });
    return;
  }

  const { field, value } = req.body || {};
  const timestamp = new Date().toISOString();

  // If specific field provided, mutate that; otherwise apply standard tamper mutation
  if (field && value !== undefined) {
    record.data[field] = value;
  } else if (record.type === 'certificate') {
    record.data.course = `${record.data.course || 'Degree'} [UNAUTHORIZED MODIFICATION]`;
  } else if (record.type === 'donation') {
    record.data.amount = (Number(record.data.amount) || 100) * 10; // Manipulate donation amount
  }

  record.updated_at = timestamp;
  record.audit_trail.push({
    id: `aud-${crypto.randomBytes(3).toString('hex')}`,
    event: 'Updated',
    timestamp,
    actor: 'External / Direct DB Mutation',
    details: 'Unauthorized record mutation performed without cryptographic re-signing.',
  });

  saveLedger();

  const baseUrl = getBaseUrl(req);
  res.json({
    message: 'Record content successfully modified in storage. Integrity mismatch will trigger upon verification.',
    id: record.id,
    type: record.type,
    record_data: record.data,
    anchored_hash: record.hash,
    new_computed_hash: calculateCanonicalHash(record.data),
    verification_url: `${baseUrl}/verify/${record.id}`,
  });
});

// POST /api/records/:id/restore - Restores original record data
app.post('/api/records/:id/restore', (req: Request, res: Response) => {
  const { id } = req.params;
  const record = ledgerRecords.get(id);

  if (!record) {
    res.status(404).json({ error: `Record "${id}" not found.` });
    return;
  }

  record.data = { ...record.original_data_backup };
  const timestamp = new Date().toISOString();
  record.updated_at = timestamp;
  record.audit_trail.push({
    id: `aud-${crypto.randomBytes(3).toString('hex')}`,
    event: 'Updated',
    timestamp,
    actor: 'Administrator',
    details: 'Record restored to original cryptographic anchor state.',
  });

  saveLedger();

  res.json({
    message: 'Record restored to original authenticated payload.',
    id: record.id,
    record_data: record.data,
    status: 'VERIFIED',
  });
});

// ----------------------------------------------------
// FRONTEND SERVING (Vite in dev, static dist in prod)
// ----------------------------------------------------
async function startServer() {
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrustLedger PS-12 server running at http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
