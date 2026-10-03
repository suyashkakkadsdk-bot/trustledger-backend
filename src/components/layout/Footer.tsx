import React from 'react';
import { Shield } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur-md py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#071A2B] flex items-center justify-center border border-[#00C2D7]/30">
              <Shield className="w-3.5 h-3.5 text-[#00C2D7]" />
            </div>
            <span className="text-sm font-bold text-[#071A2B]">
              Trust<span className="text-[#00C2D7]">Ledger</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">PS-12</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
            <button onClick={() => navigate('/')} className="hover:text-[#071A2B] transition-colors">
              Home
            </button>
            <button onClick={() => navigate('/create/certificate')} className="hover:text-[#071A2B] transition-colors">
              Certificate
            </button>
            <button onClick={() => navigate('/create/donation')} className="hover:text-[#071A2B] transition-colors">
              Donation
            </button>
            <button onClick={() => navigate('/verify')} className="hover:text-[#071A2B] transition-colors">
              Verify
            </button>
            <button onClick={() => navigate('/records')} className="hover:text-[#071A2B] transition-colors">
              Ledger
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Cryptographic Integrity Platform · 2026
          </div>
        </div>
      </div>
    </footer>
  );
};
