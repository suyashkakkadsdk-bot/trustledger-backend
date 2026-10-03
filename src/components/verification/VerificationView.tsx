import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  FileQuestion,
  RotateCw,
  Calendar,
  Building2,
  User,
  Award,
  HeartHandshake,
  Clock,
  History,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  Terminal,
  DollarSign,
} from "lucide-react";

import {
  verifyRecord,
  getAuditHistory,
  tamperRecord,
  restoreRecord,
  ApiError,
} from "../../lib/api";

import type {
  VerificationResult,
  AuditResponse,
} from "../../types/ledger";

interface VerificationViewProps {
  recordId: string;
  navigate: (path: string) => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  recordId,
  navigate,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [showAuditTimeline, setShowAuditTimeline] = useState(true);
  const [showTamperDrawer, setShowTamperDrawer] = useState(false);
  const [tampering, setTampering] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const performVerification = async (id: string) => {
    if (!id || !id.trim()) {
      setError("No record identifier provided for verification.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await verifyRecord(id);

      setResult(response);

      await loadAudit(id);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError(
            `No record matching identifier "${id}" exists in the ledger.`
          );
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Verification failed due to a server connection error.");
      }

      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAudit = async (id: string) => {
    setAuditLoading(true);

    try {
      const audit = await getAuditHistory(id);
      setAuditData(audit);
    } catch (err) {
      console.warn("Failed to load audit trail:", err);
      setAuditData(null);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    performVerification(recordId);
  }, [recordId]);

  const handleCopyId = async () => {
    if (!result?.id) return;

    await navigator.clipboard.writeText(result.id);
    setCopiedId(true);

    setTimeout(() => {
      setCopiedId(false);
    }, 2000);
  };

  const handleCopyHash = async () => {
    if (!result?.hash) return;

    await navigator.clipboard.writeText(result.hash);
    setCopiedHash(true);

    setTimeout(() => {
      setCopiedHash(false);
    }, 2000);
  };

  const handleSimulateTamper = async () => {
    if (!result?.id) return;

    setTampering(true);

    try {
      await tamperRecord(result.id);
      await performVerification(result.id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Tamper simulation failed.";

      alert(message);
    } finally {
      setTampering(false);
    }
  };

  const handleRestoreRecord = async () => {
    if (!result?.id) return;

    setTampering(true);

    try {
      await restoreRecord(result.id);
      await performVerification(result.id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Restore failed.";

      alert(message);
    } finally {
      setTampering(false);
    }
  };

  const data =
    result?.record_data as Record<string, unknown> | undefined;

  const recordName =
    typeof data?.name === "string" ? data.name : "-";

  const course =
    typeof data?.course === "string" ? data.course : "-";

  const organization =
    typeof data?.organization === "string"
      ? data.organization
      : "-";

  const purpose =
    typeof data?.purpose === "string" ? data.purpose : "-";

  const amount =
    data?.amount !== undefined && data?.amount !== null
      ? String(data.amount)
      : "-";

  const date =
    typeof data?.date === "string" ? data.date : "-";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-[#00C2D7] tracking-wider uppercase">
            Cryptographic Integrity Engine
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071A2B] tracking-tight mt-1 flex items-center gap-3">
            <span>Record Verification</span>

            <span className="font-mono text-sm sm:text-base font-normal text-slate-500">
              #{recordId}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => performVerification(recordId)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#071A2B] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <RotateCw
              className={`w-4 h-4 text-[#00C2D7] ${
                loading ? "animate-spin" : ""
              }`}
            />

            Re-Verify Integrity
          </button>

          <button
            onClick={() =>
              setShowTamperDrawer((previous) => !previous)
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            <Terminal className="w-4 h-4" />
            Audit & Tamper Demo
          </button>
        </div>
      </div>

      {/* TAMper drawer */}
      {showTamperDrawer && result && (
        <div className="mb-8 p-5 rounded-2xl bg-[#071A2B] text-white border border-[#00C2D7]/40 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00C2D7]" />

                <h3 className="text-sm font-bold">
                  Live Tamper-Evident Proof Console
                </h3>
              </div>

              <p className="text-xs text-slate-300 mt-2 max-w-2xl">
                This demonstrates how TrustLedger detects a change
                in stored record data when the original SHA-256 hash
                remains unchanged.
              </p>
            </div>

            <button
              onClick={() => setShowTamperDrawer(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={handleSimulateTamper}
              disabled={tampering}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#EF476F] hover:bg-[#d9385d] rounded-lg disabled:opacity-50"
            >
              {tampering ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}

              Simulate DB Tampering
            </button>

            <button
              onClick={handleRestoreRecord}
              disabled={tampering}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#071A2B] bg-[#00C2D7] hover:bg-[#19D3E6] rounded-lg disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />

              Restore Authenticated State
            </button>

            <span className="text-xs text-slate-400 font-mono">
              Current state: {result.status}
            </span>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="bg-white rounded-2xl border border-[#00C2D7]/20 p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E8FBFD] border border-[#00C2D7]/40 mb-4">
            <Cpu className="w-8 h-8 text-[#00C2D7] animate-spin" />
          </div>

          <h2 className="text-xl font-bold text-[#071A2B]">
            Scanning Cryptographic Integrity...
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Reading record data and recalculating SHA-256 integrity checksum.
          </p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-500 mb-4">
            <FileQuestion className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-[#071A2B]">
            Cryptographic Record Not Found
          </h2>

          <p className="text-sm text-slate-600 mt-2">
            {error}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate("/verify")}
              className="px-4 py-2 text-xs font-semibold text-[#071A2B] bg-[#E8FBFD] border border-[#00C2D7]/30 rounded-xl"
            >
              Verify Another Identifier
            </button>

            <button
              onClick={() => navigate("/records")}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
            >
              Browse Active Ledger
            </button>
          </div>
        </div>
      )}

      {/* RESULT */}
      {!loading && result && (
        <div className="space-y-8">

          {/* VERIFIED */}
          {result.status === "VERIFIED" ? (
            <div className="relative overflow-hidden bg-gradient-to-r from-[#DDF8EF] via-white to-[#DDF8EF]/40 border-2 border-[#0FAF83] rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0FAF83] text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#0FAF83] text-white mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      VERIFIED AUTHENTIC
                    </div>

                    <h2 className="text-2xl font-extrabold text-[#071A2B]">
                      Integrity Fingerprint Confirmed
                    </h2>

                    <p className="text-sm text-slate-700 mt-1">
                      This record matches its stored SHA-256 integrity fingerprint.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] uppercase font-bold text-slate-500 block">
                    Verified At
                  </span>

                  <span className="font-mono text-xs text-[#071A2B]">
                    {result.verified_at
                      ? new Date(result.verified_at).toLocaleString()
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* TAMPER */
            <div className="relative overflow-hidden bg-gradient-to-r from-[#FFF0F3] via-white to-[#FFF0F3] border-2 border-[#EF476F] rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4">

                <div className="w-14 h-14 rounded-2xl bg-[#EF476F] text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-8 h-8" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#EF476F] text-white mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    TAMPER DETECTED
                  </div>

                  <h2 className="text-2xl font-extrabold text-[#EF476F]">
                    Cryptographic Checksum Mismatch
                  </h2>

                  <p className="text-sm text-slate-800 mt-1">
                    The stored record does not match its original integrity fingerprint.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-white border border-[#EF476F]/30 space-y-3">

                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    Original Hash
                  </span>

                  <span className="font-mono text-xs text-slate-600 break-all">
                    {result.hash}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[#EF476F] block mb-1">
                    Recomputed Hash
                  </span>

                  <span className="font-mono text-xs text-[#EF476F] break-all">
                    {result.computed_hash}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* MAIN DATA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">

              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">

                <div className="flex items-center gap-2">
                  {result.type === "certificate" ? (
                    <Award className="w-5 h-5 text-[#00C2D7]" />
                  ) : (
                    <HeartHandshake className="w-5 h-5 text-[#00C2D7]" />
                  )}

                  <h3 className="text-lg font-bold text-[#071A2B] capitalize">
                    {result.type} Record Metadata
                  </h3>
                </div>

                <span className="font-mono text-xs px-3 py-1 bg-slate-100 rounded-md">
                  Type: {result.type}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* ID */}
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                    Record Identifier
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#071A2B] break-all">
                      {result.id}
                    </span>

                    <button
                      onClick={handleCopyId}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      {copiedId ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0FAF83]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ISSUER */}
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                    Issuing Authority ID
                  </span>

                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded">
                    {result.issuer_id || "-"}
                  </span>
                </div>

                {/* NAME */}
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                    Recipient / Donor Name
                  </span>

                  <div className="flex items-center gap-2 text-sm font-bold text-[#071A2B]">
                    <User className="w-4 h-4 text-slate-400" />
                    {recordName}
                  </div>
                </div>

                {/* CERTIFICATE COURSE */}
                {result.type === "certificate" && (
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                      Qualification / Degree
                    </span>

                    <div className="flex items-center gap-2 text-sm font-semibold text-[#071A2B]">
                      <Award className="w-4 h-4 text-[#00C2D7]" />
                      {course}
                    </div>
                  </div>
                )}

                {/* ORGANIZATION */}
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                    Organization
                  </span>

                  <div className="flex items-center gap-2 text-sm font-medium text-[#071A2B]">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {organization}
                  </div>
                </div>

                {/* DATE */}
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                    Date
                  </span>

                  <div className="flex items-center gap-2 text-sm font-medium text-[#071A2B]">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {date}
                  </div>
                </div>

                {/* DONATION AMOUNT */}
                {result.type === "donation" && (
                  <>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                        Donation Amount
                      </span>

                      <div className="flex items-center gap-2 text-sm font-bold text-[#071A2B]">
                        <DollarSign className="w-4 h-4 text-[#0FAF83]" />
                        {amount}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                        Purpose
                      </span>

                      <div className="flex items-center gap-2 text-sm font-medium text-[#071A2B]">
                        <HeartHandshake className="w-4 h-4 text-[#00C2D7]" />
                        {purpose}
                      </div>
                    </div>
                  </>
                )}
              </div>
              )}

          {/* END CONDITIONAL RECORD FIELDS */}

          {/* Cryptographic Hash */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Authoritative Cryptographic Checksum (SHA-256)
              </span>

              <button
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#00C2D7] hover:text-[#071A2B]"
              >
                {copiedHash ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Checksum
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#071A2B] rounded-xl p-4">
              <p className="font-mono text-[11px] sm:text-xs text-[#00C2D7] break-all leading-relaxed">
                {result.hash}
              </p>
            </div>
          </div>

          {/* Current Computed Hash */}
          {result.status !== 'VERIFIED' && result.computed_hash && (
            <div className="pt-2">
              <span className="text-xs text-[#EF476F] font-semibold uppercase tracking-wider block mb-2">
                Recomputed Checksum
              </span>

              <div className="bg-[#FFF0F3] border border-[#EF476F]/30 rounded-xl p-4">
                <p className="font-mono text-[11px] sm:text-xs text-[#EF476F] break-all leading-relaxed font-semibold">
                  {result.computed_hash}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - QR + AUDIT */}
        <div className="lg:col-span-4 space-y-8">

          {/* QR CODE CARD */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-[#071A2B]">
                  Public Verification
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Scan to verify this record
                </p>
              </div>

              <ExternalLink className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex justify-center">
              <QRCodeDisplay
                value={`${window.location.origin}/verify/${result.id}`}
              />
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                Verification URL
              </span>

              <p className="font-mono text-[10px] text-slate-700 break-all">
                {`${window.location.origin}/verify/${result.id}`}
              </p>
            </div>

            <button
              onClick={() =>
                window.open(
                  `${window.location.origin}/verify/${result.id}`,
                  '_blank'
                )
              }
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#071A2B] bg-[#E8FBFD] border border-[#00C2D7]/30 rounded-xl hover:bg-[#00C2D7]/20 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Public Verification
            </button>
          </div>

          {/* AUDIT TIMELINE */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <button
              onClick={() =>
                setShowAuditTimeline(!showAuditTimeline)
              }
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-[#00C2D7]" />

                <div className="text-left">
                  <h3 className="text-sm font-bold text-[#071A2B]">
                    Timeline Information
                  </h3>

                  <p className="text-[11px] text-slate-500">
                    Cryptographic audit history
                  </p>
                </div>
              </div>

              {showAuditTimeline ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showAuditTimeline && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4">

                {auditLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <RefreshCw className="w-5 h-5 text-[#00C2D7] animate-spin" />
                  </div>
                ) : auditData?.events?.length ? (
                  <div className="space-y-4">

                    {auditData.events.map(
                      (event: AuditEvent, index: number) => (
                        <div
                          key={event.id || index}
                          className="relative pl-7"
                        >
                          {index !== auditData.events.length - 1 && (
                            <div className="absolute left-[7px] top-5 bottom-[-18px] w-px bg-slate-200" />
                          )}

                          <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-[#E8FBFD] border-2 border-[#00C2D7]" />

                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#071A2B]">
                                {event.event}
                              </span>

                              <span className="font-mono text-[10px] text-slate-400">
                                {new Date(
                                  event.timestamp
                                ).toLocaleString()}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 mt-1">
                              {event.details}
                            </p>

                            {event.actor && (
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                Actor: {event.actor}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="w-6 h-6 text-slate-300 mx-auto mb-2" />

                    <p className="text-xs text-slate-500">
                      No audit events available.
                    </p>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      </div>

      {/* BOTTOM VERIFICATION SUMMARY */}
      <div className="mt-8 bg-[#071A2B] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                result.status === 'VERIFIED'
                  ? 'bg-[#0FAF83]'
                  : 'bg-[#EF476F]'
              }`}
            >
              {result.status === 'VERIFIED' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Verification Result
              </p>

              <p className="text-sm font-bold mt-0.5">
                {result.status === 'VERIFIED'
                  ? 'Cryptographic integrity confirmed'
                  : 'Cryptographic integrity mismatch detected'}
              </p>
            </div>
          </div>

          <button
            onClick={() => performVerification(result.id)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#071A2B] text-xs font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${
                loading ? 'animate-spin' : ''
              }`}
            />
            Re-Verify
          </button>

        </div>
      </div>

    </div>
  )}
</div>
  );
};
            