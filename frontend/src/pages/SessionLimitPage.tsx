import React from 'react';
import { useNavigate } from 'react-router-dom';

export function SessionLimitPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-md">
      <main className="w-full max-w-sm mx-auto flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-8 shadow-sm">
          <span
            className="material-symbols-outlined text-4xl text-outline"
            style={{ fontSize: '40px' }}
          >
            devices_fold
          </span>
        </div>
        <div className="space-y-4 mb-10">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Limite de dispositivos
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Esta sessão já atingiu o número máximo de dispositivos conectados.
          </p>
        </div>
        <div className="w-full flex flex-col items-center space-y-6">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 px-6 rounded-xl hover:bg-on-primary-fixed-variant transition-colors shadow-sm active:scale-95 duration-150"
          >
            Criar nova sessão
          </button>
          <a
            className="font-label-md text-label-md text-secondary hover:text-primary transition-colors cursor-pointer"
            onClick={() => navigate('/')}
          >
            Voltar ao início
          </a>
        </div>
      </main>
    </div>
  );
}
