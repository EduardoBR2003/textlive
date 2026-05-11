import React from 'react';

interface ConnectedDevicesBadgeProps {
  count: number;
  className?: string;
}

export function ConnectedDevicesBadge({
  count,
  className,
}: ConnectedDevicesBadgeProps) {
  if (count === 0) return null;

  return (
    <div
      className={`hidden sm:flex items-center gap-2 text-on-surface-variant font-label-md text-label-md ${className || ''}`}
    >
      <span className="material-symbols-outlined text-[20px]">devices</span>
      {count} {count === 1 ? 'dispositivo conectado' : 'dispositivos conectados'}
    </div>
  );
}
