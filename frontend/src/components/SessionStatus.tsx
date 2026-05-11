import React from 'react';

interface SessionStatusProps {
  isActive: boolean;
  isSynced?: boolean;
  isSaving?: boolean;
}

export function SessionStatus({
  isActive,
  isSynced = false,
  isSaving = false,
}: SessionStatusProps) {
  if (!isActive) return null;

  return (
    <div className="hidden md:flex items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm">
      <span
        className={`w-2 h-2 rounded-full ${
          isSaving
            ? 'bg-tertiary animate-pulse'
            : isSynced
              ? 'bg-green-500'
              : 'bg-primary animate-pulse'
        }`}
      />
      {isSaving ? 'Salvando...' : isSynced ? 'Sincronizado' : 'Sessão ativa'}
    </div>
  );
}
