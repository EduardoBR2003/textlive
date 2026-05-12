import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi } from '@/services/sessionApi';
import { SessionPermission } from '@/types/session';

export function HomePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateSession = useCallback(async () => {
    setIsCreating(true);
    setError('');
    try {
      const result = await sessionApi.createSession({
        permission: SessionPermission.EDIT,
        deviceLimit: 2,
      });
      localStorage.setItem(`textlive_owner_${result.slug}`, result.ownerToken);
      navigate(`/s/${result.slug}`, {
        state: { ownerToken: result.ownerToken },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao criar sessão',
      );
    } finally {
      setIsCreating(false);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-md">
      <main className="w-full max-w-md mx-auto flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-8 shadow-sm">
          <span
            className="material-symbols-outlined text-outline"
            style={{ fontSize: '40px' }}
          >
            edit
          </span>
        </div>

        <div className="space-y-4 mb-10">
          <h1 className="font-display-lg text-display-lg text-on-surface">
            TextLive
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Editor de texto colaborativo em tempo real. Simples, rápido e seguro.
          </p>
        </div>

        {error && (
          <div className="w-full bg-error-container text-on-error-container font-body-sm text-body-sm p-3 rounded-lg mb-md">
            {error}
          </div>
        )}

        <div className="w-full flex flex-col items-center space-y-4">
          <button
            onClick={handleCreateSession}
            disabled={isCreating}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 px-6 rounded-xl hover:bg-on-primary-fixed-variant transition-colors shadow-sm active:scale-95 duration-150 disabled:opacity-50"
          >
            {isCreating ? 'Criando...' : 'Criar nova sessão'}
          </button>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Nenhum cadastro necessário. Comece agora mesmo.
          </p>
        </div>
      </main>
    </div>
  );
}
