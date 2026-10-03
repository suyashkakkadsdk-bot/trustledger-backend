import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/home/HomePage';
import { CreateCertificateForm } from './components/forms/CreateCertificateForm';
import { CreateDonationForm } from './components/forms/CreateDonationForm';
import { VerificationView } from './components/verification/VerificationView';
import { VerificationLookup } from './components/verification/VerificationLookup';
import { RecordsExplorer } from './components/records/RecordsExplorer';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Route matching
  const renderCurrentView = () => {
    // /verify/:id route
    if (currentPath.startsWith('/verify/')) {
      const id = currentPath.replace('/verify/', '').split('?')[0].split('#')[0];
      if (id) {
        return <VerificationView recordId={decodeURIComponent(id)} navigate={navigate} />;
      }
    }

    if (currentPath === '/verify') {
      return <VerificationLookup navigate={navigate} />;
    }

    if (currentPath === '/create/certificate') {
      return <CreateCertificateForm navigate={navigate} />;
    }

    if (currentPath === '/create/donation') {
      return <CreateDonationForm navigate={navigate} />;
    }

    if (currentPath === '/records') {
      return <RecordsExplorer navigate={navigate} />;
    }

    // Default: Home
    return <HomePage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5FCFD] bg-security-grid text-[#071A2B] font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">
        {renderCurrentView()}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}
