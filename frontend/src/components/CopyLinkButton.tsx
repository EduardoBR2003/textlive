import React, { useCallback, useState } from 'react';
import { useClipboard } from '@/hooks/useClipboard';

interface CopyLinkButtonProps {
  url: string;
  label?: string;
  className?: string;
}

export function CopyLinkButton({
  url,
  label = 'Copiar Link',
  className,
}: CopyLinkButtonProps) {
  const { copyToClipboard } = useClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url, copyToClipboard]);

  return (
    <button
      onClick={handleCopy}
      className={`w-full py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm active:scale-[0.98] ${className || ''}`}
    >
      {copied ? 'Copiado!' : label}
    </button>
  );
}
