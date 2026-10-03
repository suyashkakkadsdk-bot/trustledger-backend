import React, { useState } from 'react';
import { HeartHandshake, Building2, Calendar, User, DollarSign, Target, ShieldCheck, ArrowRight, CheckCircle2, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { createDonation, ApiError } from '../../lib/api';
import type { LedgerRecord } from '../../types/ledger';
import { QRCodeDisplay } from '../qr/QRCodeDisplay';

interface CreateDonationFormProps {
  navigate: (path: string) => void;
}

export const CreateDonationForm: React.FC<CreateDonationFormProps> = ({ navigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    organization: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0],
    issuer_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRecord, setCreatedRecord] = useState<LedgerRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(formData.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please provide a valid numeric donation amount greater than 0.');
      return;
    }

    setLoading(true);

    try {
      const record = await createDonation({
        name: formData.name,
        amount: numericAmount, // Strict numeric type
        organization: formData.organization,
        purpose: formData.purpose,
        date: formData.date,
        issuer_id: formData.issuer_id.trim() || undefined,
      });

      setCreatedRecord(record);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err?.message || 'Failed to submit donation record to the cryptographic ledger.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (createdRecord?.verification_url) {
      navigator.clipboard.writeText(createdRecord.verification_url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReset = () => {
    setCreatedRecord(null);
    setFormData({
      name: '',
      amount: '',
      organization: '',
      purpose: '',
      date: new Date().toISOString().split('T')[0],
      issuer_id: '',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071A2B] tracking-tight">
          Issue Cryptographic Donation Receipt
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
          Anchors an immutable donation record into the ledger for end-to-end philanthropic transparency. The backend generates a tamper-evident SHA-256 fingerprint that guarantees funds and purpose cannot be altered.
        </p>
      </div>

      {createdRecord ? (
        /* Success State */
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#00C2D7]/20 shadow-[0_10px_35px_rgba(0,194,215,0.08)] p-6 sm:p-10 transition-all">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#DDF8EF] border border-[#0FAF83]/30 flex items-center justify-center text-[#0FAF83]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#0FAF83] tracking-wide uppercase">
                    Anchoring Successful
                  </div>
                  <h2 className="text-xl font-bold text-[#071A2B]">
                    Donation Anchored to Ledger
                  </h2>
                </div>
              </div>

              {/* Authoritative Backend Data Display */}
              <div className="bg-[#F5FCFD] border border-[#00C2D7]/20 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Authoritative Record ID</span>
                    <span className="font-mono text-sm font-bold text-[#071A2B]">
                      {createdRecord.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Integrity Status</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0FAF83]">
                      <span className="w-2 h-2 rounded-full bg-[#0FAF83]" />
                      {createdRecord.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Donor Name</span>
                    <span className="text-sm font-medium text-[#071A2B]">
                      {createdRecord.record_data.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Verified Amount</span>
                    <span className="font-mono text-sm font-bold text-[#0FAF83] tabular-nums">
                      ${Number((createdRecord.record_data as any).amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Beneficiary Organization</span>
                    <span className="text-sm font-medium text-[#071A2B]">
                      {createdRecord.record_data.organization}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Designated Purpose</span>
                    <span className="text-sm font-medium text-[#071A2B]">
                      {(createdRecord.record_data as any).purpose}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#00C2D7]/15">
                  <span className="text-xs text-slate-500 font-medium block mb-1">
                    SHA-256 Cryptographic Checksum
                  </span>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-xs text-[#071A2B] break-all select-all">
                    {createdRecord.hash}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => navigate(`/verify/${createdRecord.id}`)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#071A2B] hover:bg-[#0B2742] rounded-xl shadow-sm transition-all border border-[#00C2D7]/40"
                >
                  <span>Verify Record Now</span>
                  <ArrowRight className="w-4 h-4 text-[#00C2D7]" />
                </button>

                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#0FAF83]" />
                      <span>Copied Verification URL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy Verification URL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-[#071A2B] hover:bg-slate-100 rounded-xl transition-colors ml-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Issue Another</span>
                </button>
              </div>
            </div>

            {/* Verification QR Card */}
            <div className="w-full md:w-auto flex flex-col items-center">
              <QRCodeDisplay
                value={createdRecord.verification_url}
                size={190}
                label="Scan to Verify Donation"
                sublabel={createdRecord.id}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Create Form + Security Info Card */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Card */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-[#FFF0F3] border border-[#EF476F]/30 rounded-xl flex items-start gap-3 text-sm text-[#EF476F]">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#071A2B] uppercase tracking-wider mb-1.5">
                  Donor Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. David Vance Foundation"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-[#071A2B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C2D7] focus:border-[#00C2D7] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#071A2B] uppercase tracking-wider mb-1.5">
                    Amount (USD) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="10000"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-[#071A2B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C2D7] focus:border-[#00C2D7] transition-all font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#071A2B] uppercase tracking-wider mb-1.5">
                    Donation Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-[#071A2B] focus:outline-none focus:ring-2 focus:ring-[#00C2D7] focus:border-[#00C2D7] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071A2B] uppercase tracking-wider mb-1.5">
                  Beneficiary Organization *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Clean Oceans Global Initiative"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-[#071A2B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C2D7] focus:border-[#00C2D7] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071A2B] uppercase tracking-wider mb-1.5">
                  Designated Purpose / Initiative *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="e.g. Pacific Coral Reef Restoration Fleet"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-[#071A2B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C2D7] focus:border-[#00C2D7] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Issuer Identity (Optional)
                </label>
                <input
                  type="text"
                  value={formData.issuer_id}
                  onChange={(e) => setFormData({ ...formData, issuer_id: e.target.value })}
                  placeholder="Default: TL-DONATION-REGISTRAR-02"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-[#071A2B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C2D7] focus:border-[#00C2D7] transition-all font-mono text-xs"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#071A2B] via-[#0B2742] to-[#071A2B] hover:opacity-95 active:scale-[0.99] rounded-xl shadow-md border border-[#00C2D7]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-[#00C2D7] rounded-full animate-spin" />
                      <span>Computing SHA-256 & Anchoring...</span>
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="w-4 h-4 text-[#00C2D7]" />
                      <span>Create Donation Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Info Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-[#071A2B] to-[#0B2742] text-white rounded-2xl p-6 sm:p-7 border border-[#00C2D7]/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00C2D7]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2.5 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#00C2D7]" />
                <h3 className="text-base font-bold tracking-tight">
                  Philanthropic Proof-of-Trust
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                Every dollar committed is locked with a cryptographic digest preventing retrospective re-allocation or double reporting.
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex gap-3">
                  <span className="font-mono text-[#00C2D7] font-bold">01</span>
                  <div>
                    <h4 className="font-semibold text-white">Immutable Amount Lock</h4>
                    <p className="text-slate-300 mt-0.5">
                      Numeric funding amounts are serialized directly into the hash checksum.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="font-mono text-[#00C2D7] font-bold">02</span>
                  <div>
                    <h4 className="font-semibold text-white">Purpose Binding</h4>
                    <p className="text-slate-300 mt-0.5">
                      Designated projects cannot be swapped without triggering an immediate integrity alarm.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="font-mono text-[#00C2D7] font-bold">03</span>
                  <div>
                    <h4 className="font-semibold text-white">Independent Verification</h4>
                    <p className="text-slate-300 mt-0.5">
                      Donors and public auditors can independently scan and verify integrity without registration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Cryptographic Scheme</span>
                <span className="font-mono text-[#00C2D7]">SHA-256 CANONICAL</span>
              </div>
            </div>

            <div className="bg-[#E8FBFD] border border-[#00C2D7]/30 rounded-xl p-4 text-xs text-[#071A2B]">
              <span className="font-semibold block mb-1">Authoritative Backend Calculation</span>
              The frontend never submits precomputed hashes or decides verification states. Integrity fingerprints are strictly computed server-side.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
