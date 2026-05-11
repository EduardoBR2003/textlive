import React from 'react';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-md">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" />
        <p className="font-body-md text-body-md text-on-surface-variant">
          Carregando...
        </p>
      </div>
    </div>
  );
}
