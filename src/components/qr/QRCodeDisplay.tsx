import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, ExternalLink, QrCode, Check } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  sublabel?: string;
  showDownload?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 180,
  label = 'Scan to verify this record',
  sublabel = 'Cryptographically anchored URL',
  showDownload = true,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!value) return;

    QRCode.toDataURL(value, {
      width: size * 2, // 2x for retina sharpness
      margin: 1.5,
      color: {
        dark: '#071A2B', // Deep Navy from spec
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [value, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-[#00C2D7]/20 shadow-[0_8px_30px_rgb(0,194,215,0.08)]">
      <div className="relative group p-3 bg-white rounded-xl border border-slate-100 shadow-inner">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Verification QR Code"
            width={size}
            height={size}
            className="rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex flex-col items-center justify-center bg-slate-50 rounded-lg text-slate-400 gap-2"
          >
            <QrCode className="w-8 h-8 animate-pulse text-[#00C2D7]" />
            <span className="text-xs">Generating QR...</span>
          </div>
        )}
      </div>

      <div className="text-center mt-3">
        <p className="text-xs font-semibold text-[#071A2B]">{label}</p>
        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[220px]">
          {sublabel}
        </p>
      </div>

      {showDownload && (
        <div className="flex items-center gap-2 mt-3 w-full">
          {dataUrl && (
            <a
              href={dataUrl}
              download="trustledger-verification-qr.png"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#071A2B] bg-[#E8FBFD] hover:bg-[#00C2D7]/20 border border-[#00C2D7]/30 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#00C2D7]" />
              Download QR
            </a>
          )}
          <button
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0FAF83]" />
                Copied
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                Copy Link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
