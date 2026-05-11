import React, { useMemo } from 'react';

interface QRCodeCardProps {
  url: string;
  className?: string;
}

export function QRCodeCard({ url, className }: QRCodeCardProps) {
  const qrCodeUrl = useMemo(() => {
    const encoded = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&bgcolor=faf8ff&color=004ac6`;
  }, [url]);

  return (
    <div
      className={`bg-surface rounded-xl border border-outline-variant p-lg flex flex-col items-center gap-md ${className || ''}`}
    >
      <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
        QR Code
      </h3>
      <div className="bg-white p-4 rounded-lg border border-outline-variant">
        <img
          src={qrCodeUrl}
          alt="QR Code da sessão"
          className="w-[200px] h-[200px]"
          width={200}
          height={200}
        />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
        Escaneie para acessar a sessão
      </p>
    </div>
  );
}
