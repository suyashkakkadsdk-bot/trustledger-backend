import React, { useState } from 'react';
import { Shield, FileCheck, HeartHandshake, Search, Database, Menu, X, Lock } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/', icon: Shield },
    { label: 'Create Certificate', path: '/create/certificate', icon: FileCheck },
    { label: 'Create Donation', path: '/create/donation', icon: HeartHandshake },
    { label: 'Verify Record', path: '/verify', icon: Search },
    { label: 'Ledger Records', path: '/records', icon: Database },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/85 border-b border-[#00C2D7]/15 shadow-[0_2px_15px_rgba(7,26,43,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark with Shield Emblem */}
        <button
          onClick={() => handleNav('/')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#071A2B] to-[#0B2742] flex items-center justify-center shadow-sm border border-[#00C2D7]/30 transition-transform group-hover:scale-105">
            <Shield className="w-4 h-4 text-[#00C2D7]" />
            <div className="absolute inset-0 rounded-lg bg-[#00C2D7]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#071A2B] font-['Plus_Jakarta_Sans']">
            Trust<span className="text-[#00C2D7]">Ledger</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`relative py-1 transition-colors whitespace-nowrap focus:outline-none ${
                  isActive
                    ? 'text-[#071A2B] font-semibold'
                    : 'text-slate-600 hover:text-[#071A2B]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00C2D7] to-[#19D3E6] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Authenticated Context / Quick Action */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 bg-[#E8FBFD] border border-[#00C2D7]/20 rounded-md">
            <Lock className="w-3 h-3 text-[#00C2D7]" />
            <span className="font-mono text-[11px] text-[#071A2B]">PS-12 Engine</span>
          </div>

          <button
            onClick={() => handleNav('/verify')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#071A2B] hover:bg-[#0B2742] active:bg-[#071A2B] border border-[#00C2D7]/40 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-[#00C2D7]/40"
          >
            <Search className="w-3.5 h-3.5 text-[#00C2D7]" />
            <span>Verify Checksum</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-[#071A2B] hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-left transition-colors ${
                currentPath === item.path
                  ? 'bg-[#E8FBFD] text-[#071A2B] font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-4 h-4 text-[#00C2D7]" />
              {item.label}
            </button>
          ))}
          <div className="pt-2">
            <button
              onClick={() => handleNav('/verify')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-white bg-[#071A2B] rounded-lg"
            >
              <Search className="w-4 h-4 text-[#00C2D7]" />
              Verify Checksum
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
