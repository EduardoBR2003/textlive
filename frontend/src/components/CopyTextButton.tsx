import React, { useCallback, useState } from 'react';
import { useClipboard } from '@/hooks/useClipboard';

interface CopyTextButtonProps {
  text: string;
  label?: string;
}

export function CopyTextButton({ text, label = 'Copiar' }: CopyTextButtonProps) {
  const { copyToClipboard } = useClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text, copyToClipboard]);

  return (
    <div
      className="bg-surface rounded-lg border border-outline-variant p-sm flex items-center justify-between group hover:border-primary transition-colors cursor-pointer"
      onClick={handleCopy}
    >
      <p className="font-label-md text-label-md text-on-surface truncate">{text}</p>
      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-[18px]">
        {copied ? 'check' : 'content_copy'}
      </span>
    </div>
  );
}
