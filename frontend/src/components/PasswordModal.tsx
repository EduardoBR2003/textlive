import React, { useState, useCallback } from 'react';
import { validatePasswordInput } from '@/utils/validatePasswordInput';

interface PasswordModalProps {
  isOpen: boolean;
  currentPassword: string | null;
  onSave: (password: string | null) => Promise<void>;
  onClose: () => void;
}

export function PasswordModal({
  isOpen,
  currentPassword,
  onSave,
  onClose,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [isEnabled, setIsEnabled] = useState(!!currentPassword);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setError('');

    if (isEnabled) {
      const validation = validatePasswordInput(password);
      if (!validation.valid) {
        setError(validation.message);
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave(isEnabled ? password : null);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar senha',
      );
    } finally {
      setIsSaving(false);
    }
  }, [isEnabled, password, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-surface rounded-xl border border-outline-variant shadow-lg p-lg w-full max-w-sm mx-md">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">
          Proteger com senha
        </h2>

        <div className="flex items-center justify-between mb-md">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Ativar proteção por senha
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
            />
            <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>

        {isEnabled && (
          <input
            type="password"
            className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary-fixed-dim outline-none transition-colors mb-md"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {error && (
          <p className="font-body-sm text-body-sm text-error mb-sm">{error}</p>
        )}

        <div className="flex gap-sm">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-surface-container-high text-on-surface-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
