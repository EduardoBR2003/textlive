import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionApi } from '@/services/sessionApi';
import { validatePasswordInput } from '@/utils/validatePasswordInput';
import { generateLocalDeviceId } from '@/utils/generateLocalDeviceId';

export function ProtectedSessionPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      const validation = validatePasswordInput(password);
      if (!validation.valid) {
        setError(validation.message);
        return;
      }

      if (!slug) return;

      setIsSubmitting(true);
      try {
        const deviceId = generateLocalDeviceId();
        await sessionApi.joinSession(slug, { deviceId, password });
        sessionStorage.setItem(`textlive_auth_${slug}`, 'true');
        navigate(`/s/${slug}`, { replace: true });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao verificar senha',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [slug, password, navigate],
  );

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-md">
      <div className="mb-lg text-center">
        <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
          TextLive
        </span>
      </div>
      <main className="w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant rounded-lg p-xl flex flex-col items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-md">
          <span
            className="material-symbols-outlined text-primary text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lock
          </span>
        </div>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-lg">
          Esta sessão está protegida
        </h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-md">
          <div className="relative w-full text-left">
            <input
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all"
              id="session-password"
              name="session-password"
              placeholder="Insira a senha"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <p className="font-body-sm text-body-sm text-error text-left">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-4 rounded-lg hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Verificando...' : 'Entrar na sessão'}
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
        </form>
        <button
          onClick={() => navigate('/')}
          className="mt-lg font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
        >
          Voltar ao início
        </button>
      </main>
    </div>
  );
}
