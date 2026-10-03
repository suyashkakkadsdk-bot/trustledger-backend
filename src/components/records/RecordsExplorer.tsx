import React, { useEffect, useState } from 'react';
import { Database, Search, ShieldCheck, AlertTriangle, ArrowRight, Award, HeartHandshake, RefreshCw, PlusCircle, ExternalLink } from 'lucide-react';
import { listRecords, ApiError } from '../../lib/api';
import type { LedgerRecord } from '../../types/ledger';

interface RecordsExplorerProps {
  navigate: (path: string) => void;
}

export const RecordsExplorer: React.FC<RecordsExplorerProps> = ({ navigate }) => {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'certificate' | 'donation'>('all');

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listRecords();
      setRecords(data);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch records from ledger backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((rec) => {
    if (filterType !== 'all' && rec.type !== filterType) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const idMatch = rec.id.toLowerCase().includes(term);
    const hashMatch = rec.hash.toLowerCase().includes(term);
    const nameMatch = (rec.record_data?.name || '').toLowerCase().includes(term);
    const orgMatch = (rec.record_data?.organization || '').toLowerCase().includes(term);
    return idMatch || hashMatch || nameMatch || orgMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-[#00C2D7] tracking-wider uppercase">
            Authoritative Ledger Store
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071A2B] tracking-tight mt-1">
            Registered Cryptographic Records
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real data stored and verified by the TrustLedger PS-12 integrity engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#071A2B] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00C2D7] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>

          <button
            onClick={() => navigate('/create/certificate')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#071A2B] hover:bg-[#0B2742] rounded-xl shadow-sm transition-colors border border-[#00C2D7]/30"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#00C2D7]" />
            <span>New Record</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, name, organization, or hash..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-[#071A2B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C2D7] focus:border-[#00C2D7] transition-all"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-white text-[#071A2B] shadow-sm font-semibold'
                : 'text-slate-600 hover:text-[#071A2B]'
            }`}
          >
            All Records ({records.length})
          </button>
          <button
            onClick={() => setFilterType('certificate')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'certificate'
                ? 'bg-white text-[#071A2B] shadow-sm font-semibold'
                : 'text-slate-600 hover:text-[#071A2B]'
            }`}
          >
            Certificates
          </button>
          <button
            onClick={() => setFilterType('donation')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'donation'
                ? 'bg-white text-[#071A2B] shadow-sm font-semibold'
                : 'text-slate-600 hover:text-[#071A2B]'
            }`}
          >
            Donations
          </button>
        </div>
      </div>

      {/* Ledger Table / List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-8 h-8 border-2 border-[#00C2D7]/20 border-t-[#00C2D7] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Querying backend ledger records...</p>
        </div>
      ) : error ? (
        <div className="bg-[#FFF0F3] border border-[#EF476F]/30 rounded-2xl p-8 text-center text-sm text-[#EF476F]">
          <p className="font-semibold">{error}</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#071A2B]">No Ledger Records Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {records.length === 0
              ? 'The cryptographic ledger is currently empty. Issue a certificate or donation receipt to begin.'
              : 'No records matched your search query.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate('/create/certificate')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#071A2B] rounded-xl hover:bg-[#0B2742] transition-colors"
            >
              Create Certificate
            </button>
            <button
              onClick={() => navigate('/create/donation')}
              className="px-4 py-2 text-xs font-semibold text-[#071A2B] bg-[#E8FBFD] border border-[#00C2D7]/30 rounded-xl hover:bg-[#00C2D7]/20 transition-colors"
            >
              Create Donation
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Subject / Details</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">SHA-256 Digest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const isVerified = rec.status === 'VERIFIED';
                  const isCert = rec.type === 'certificate';

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/verify/${rec.id}`)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#071A2B] whitespace-nowrap">
                        {rec.id}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isCert ? (
                            <Award className="w-3.5 h-3.5 text-[#00C2D7]" />
                          ) : (
                            <HeartHandshake className="w-3.5 h-3.5 text-[#00C2D7]" />
                          )}
                          <span className="capitalize font-medium text-slate-700">
                            {rec.type}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#071A2B]">{rec.record_data?.name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {isCert ? (
                            rec.record_data?.course
                          ) : (
                            `$${Number((rec.record_data as any)?.amount).toLocaleString()} · ${(rec.record_data as any)?.purpose}`
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {rec.record_data?.organization}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 tabular-nums">
                        {rec.hash.slice(0, 10)}...{rec.hash.slice(-8)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            isVerified
                              ? 'bg-[#DDF8EF] text-[#0FAF83]'
                              : 'bg-[#FFF0F3] text-[#EF476F]'
                          }`}
                        >
                          {isVerified ? (
                            <ShieldCheck className="w-3 h-3 text-[#0FAF83]" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-[#EF476F]" />
                          )}
                          {rec.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00C2D7] group-hover:text-[#071A2B] transition-colors">
                          <span>Verify</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
