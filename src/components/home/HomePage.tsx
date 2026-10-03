import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  HeartHandshake,
  ArrowRight,
  Search,
  Lock,
  QrCode,
  CheckCircle2,
  Database,
  Fingerprint,
} from 'lucide-react';
import heroVisualPath from '../../assets/images/trustledger_hero_shield_1791011123469.jpg';
import certVisualPath from '../../assets/images/cert_tamper_shield_1791011138246.jpg';
import donationVisualPath from '../../assets/images/donation_ledger_flow_1791011150350.jpg';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [quickVerifyId, setQuickVerifyId] = useState('');

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickVerifyId.trim()) return;
    navigate(`/verify/${encodeURIComponent(quickVerifyId.trim())}`);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative pt-12 sm:pt-20 overflow-hidden">
        {/* Subtle Decorative Background Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-gradient-to-tr from-[#00C2D7]/10 via-[#63E6E2]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left: Strong Typography & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-[#071A2B] bg-[#E8FBFD] border border-[#00C2D7]/30 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00C2D7] animate-pulse" />
                <span>PS-12 Cryptographic Verification Engine</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-[#071A2B] tracking-tight leading-[1.08] text-balance">
                VERIFY WHAT{' '}
                <span className="bg-gradient-to-r from-[#00C2D7] via-[#19D3E6] to-[#0FAF83] bg-clip-text text-transparent">
                  MATTERS.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                TrustLedger anchors academic credentials and philanthropic donations into an immutable ledger. Instant QR verification, bit-level tamper detection, and transparent cryptographic auditability.
              </p>

              {/* Quick Verification Input */}
              <form onSubmit={handleQuickVerify} className="pt-2 max-w-lg">
                <div className="flex items-center bg-white rounded-2xl border border-slate-300/80 shadow-md p-1.5 focus-within:ring-2 focus-within:ring-[#00C2D7] focus-within:border-[#00C2D7] transition-all">
                  <div className="pl-3.5 pr-2 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={quickVerifyId}
                    onChange={(e) => setQuickVerifyId(e.target.value)}
                    placeholder="Enter Record ID (e.g. CERT-XXXXXX)"
                    className="flex-1 min-w-0 bg-transparent py-2.5 px-2 text-sm text-[#071A2B] placeholder:text-slate-400 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#071A2B] hover:bg-[#0B2742] active:scale-95 rounded-xl shadow-sm transition-all shrink-0"
                  >
                    <span>Verify</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#00C2D7]" />
                  </button>
                </div>
              </form>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/create/certificate')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#071A2B] to-[#0B2742] hover:opacity-95 rounded-xl shadow-sm border border-[#00C2D7]/40 transition-all focus:ring-2 focus:ring-[#00C2D7]"
                >
                  <FileCheck className="w-4 h-4 text-[#00C2D7]" />
                  <span>Issue Certificate</span>
                </button>

                <button
                  onClick={() => navigate('/create/donation')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#071A2B] bg-[#E8FBFD] hover:bg-[#00C2D7]/20 border border-[#00C2D7]/30 rounded-xl transition-all"
                >
                  <HeartHandshake className="w-4 h-4 text-[#00C2D7]" />
                  <span>Issue Donation</span>
                </button>

                <button
                  onClick={() => navigate('/records')}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-slate-600 hover:text-[#071A2B] transition-colors"
                >
                  <Database className="w-4 h-4 text-slate-400" />
                  <span>Browse Ledger</span>
                </button>
              </div>
            </div>

            {/* Right: High-Fidelity Hero Cybersecurity Product Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow ring */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00C2D7]/30 to-[#63E6E2]/20 rounded-3xl blur-xl" />

                {/* Primary Card */}
                <div className="relative rounded-2xl overflow-hidden bg-[#071A2B] border border-[#00C2D7]/30 shadow-2xl">
                  <img
                    src={heroVisualPath}
                    alt="TrustLedger Holographic Verification Shield"
                    referrerPolicy="no-referrer"
                    className="w-full h-64 sm:h-72 object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                  />

                  {/* Glassmorphic Overlay Badge */}
                  <div className="p-5 bg-gradient-to-t from-[#071A2B] via-[#071A2B]/95 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#00C2D7]/20 border border-[#00C2D7]/40 flex items-center justify-center text-[#00C2D7]">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white tracking-wide">
                            SHA-256 Anchored Digest
                          </div>
                          <div className="font-mono text-[11px] text-[#00C2D7]">
                            4f8a...9c2e · VERIFIED
                          </div>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-300">
                        <QrCode className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Inspection Card */}
                <div className="absolute -bottom-6 -left-4 sm:-left-6 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#DDF8EF] border border-[#0FAF83]/30 flex items-center justify-center text-[#0FAF83] shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#0FAF83] uppercase tracking-wider block">
                      Tamper-Evident Seal
                    </span>
                    <span className="text-xs font-semibold text-[#071A2B]">
                      Zero Bit-Level Drift
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CORE CAPABILITIES ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-[#00C2D7] tracking-wider uppercase">
            Guaranteed Authenticity
          </span>
          <h2 className="text-3xl font-extrabold text-[#071A2B] tracking-tight mt-1">
            Built for High-Stakes Verification
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            TrustLedger replaces trust in unverified PDFs or screenshots with mathematically provable cryptographic integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Certificate Verification */}
          <div className="group bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:border-[#00C2D7]/40 hover:shadow-[0_8px_30px_rgba(0,194,215,0.08)] transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E8FBFD] border border-[#00C2D7]/30 flex items-center justify-center text-[#00C2D7] mb-5">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#071A2B] mb-2">
                Certificate Verification
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Academic institutions and training providers issue degrees, qualifications, and accreditations. The recipient and course fields are locked with a 256-bit digest.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">POST /api/certificates</span>
              <button
                onClick={() => navigate('/create/certificate')}
                className="text-xs font-semibold text-[#00C2D7] hover:text-[#071A2B] inline-flex items-center gap-1"
              >
                <span>Issue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Donation Verification */}
          <div className="group bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:border-[#00C2D7]/40 hover:shadow-[0_8px_30px_rgba(0,194,215,0.08)] transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E8FBFD] border border-[#00C2D7]/30 flex items-center justify-center text-[#00C2D7] mb-5">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#071A2B] mb-2">
                Donation Verification
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Non-profits and philanthropic donors bind exact funding numbers and specified initiatives. Prevents retroactive fund reallocations and duplicate claims.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">POST /api/donations</span>
              <button
                onClick={() => navigate('/create/donation')}
                className="text-xs font-semibold text-[#00C2D7] hover:text-[#071A2B] inline-flex items-center gap-1"
              >
                <span>Issue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Tamper Detection */}
          <div className="group bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:border-[#EF476F]/40 hover:shadow-[0_8px_30px_rgba(239,71,111,0.08)] transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFF0F3] border border-[#EF476F]/30 flex items-center justify-center text-[#EF476F] mb-5">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#071A2B] mb-2">
                Tamper Detection
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                If any record in the database is modified without authoritative re-signing, subsequent verification recalculates the hash and instantly raises a TAMPER DETECTED alert.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">GET /api/verify/:id</span>
              <button
                onClick={() => navigate('/verify')}
                className="text-xs font-semibold text-[#EF476F] hover:text-[#071A2B] inline-flex items-center gap-1"
              >
                <span>Verify</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#071A2B] text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#00C2D7]/20 relative overflow-hidden">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-semibold text-[#00C2D7] tracking-wider uppercase block mb-1">
              Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              How TrustLedger Validates Integrity
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              A clean 3-step pipeline anchored by server-authoritative SHA-256 fingerprinting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="font-mono text-3xl font-extrabold text-[#00C2D7]">01</div>
              <h3 className="text-lg font-bold text-white">Create Record</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The user submits clean credential or donation data through the secure interface. The client never attempts client-side hashing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="font-mono text-3xl font-extrabold text-[#00C2D7]">02</div>
              <h3 className="text-lg font-bold text-white">Cryptographic Anchor</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The backend sorts payload keys, generates a canonical SHA-256 hash, issues a Record ID, and registers an initial Created audit entry.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="font-mono text-3xl font-extrabold text-[#00C2D7]">03</div>
              <h3 className="text-lg font-bold text-white">Instant Verification</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Anyone scanning the embedded QR code triggers real-time checksum comparison. Any discrepancy instantly flags TAMPER DETECTED.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#00C2D7]/20 shadow-[0_10px_40px_rgba(0,194,215,0.06)]">
          <div className="w-12 h-12 rounded-2xl bg-[#E8FBFD] border border-[#00C2D7]/30 flex items-center justify-center text-[#00C2D7] mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071A2B] tracking-tight">
            Ready to Issue Tamper-Evident Records?
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
            Experience real server-side cryptographic anchoring. Issue your first certificate or donation receipt today.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/create/certificate')}
              className="px-6 py-3 text-sm font-semibold text-white bg-[#071A2B] hover:bg-[#0B2742] rounded-xl shadow-sm transition-all border border-[#00C2D7]/40"
            >
              Issue Certificate
            </button>
            <button
              onClick={() => navigate('/create/donation')}
              className="px-6 py-3 text-sm font-semibold text-[#071A2B] bg-[#E8FBFD] hover:bg-[#00C2D7]/20 border border-[#00C2D7]/30 rounded-xl transition-all"
            >
              Issue Donation
            </button>
            <button
              onClick={() => navigate('/records')}
              className="px-6 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Explore Ledger
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
