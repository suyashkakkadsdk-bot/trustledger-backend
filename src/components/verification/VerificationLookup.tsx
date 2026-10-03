import React, { useState } from 'react';
import { Search, Shield, ArrowRight, FileCheck, HeartHandshake, Database } from 'lucide-react';

interface VerificationLookupProps {
  navigate: (path: string) => void;
}

export const VerificationLookup: React.FC<VerificationLookupProps> = ({ navigate }) => {
  const [recordIdInput, setRecordIdInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = recordIdInput.trim();
    if (!raw) {
      setError('Please provide a record identifier or verification URL.');
      return;
    }

    // Support both raw ID and full URL paste
    let id = raw;
    if (raw.includes('/verify/')) {
      const parts = raw.split('/verify/');
      id = parts[parts.length - 1].split('?')[0].split('#')[0];
    }

    if (!id) {
      setError('Invalid record identifier.');
      return;
    }

    navigate(`/verify/${encodeURIComponent(id)}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#071A2B] to-[#0B2742] text-[#00C2D7] shadow-sm mb-4 border border-[#00C2D7]/30">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071A2B] tracking-tight">
          Verify Cryptographic Record
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Enter an authoritative Record ID or paste a verification link to query the TrustLedger PS-12 integrity engine.
        </p>
      </div>

      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-[0_10px_35px_rgba(7,26,43,0.06)] p-6 sm:p-10">
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#071A2B] uppercase tracking-wider mb-2">
              Record Identifier or Full Verification URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={recordIdInput}
                onChange={(e) => {
                  setRecordIdInput(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. CERT-B382F9A1 or DON-7E4A102D"
                className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base bg-white border border-slate-200 rounded-xl text-[#071A2B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C2D7] focus:border-[#00C2D7] transition-all font-mono"
              />
            </div>
            {error && <p className="mt-2 text-xs font-semibold text-[#EF476F]">{error}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#071A2B] hover:bg-[#0B2742] rounded-xl shadow-md border border-[#00C2D7]/40 transition-all"
            >
              <span>Query Cryptographic Status</span>
              <ArrowRight className="w-4 h-4 text-[#00C2D7]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/records')}
              className="px-5 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4 text-slate-500" />
              <span>Browse Active Ledger</span>
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500">
          <div className="flex items-start gap-2.5">
            <FileCheck className="w-4 h-4 text-[#00C2D7] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#071A2B] block">Academic Credentials</span>
              Verifies certificates, diplomas, and institutional achievements without third-party delay.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <HeartHandshake className="w-4 h-4 text-[#00C2D7] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#071A2B] block">Donation Receipts</span>
              Authenticates philanthropic funding commits, preventing retrospective diversion.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
