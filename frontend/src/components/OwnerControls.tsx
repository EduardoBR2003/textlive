import React, { useState, useCallback } from 'react';
import { sessionApi } from '@/services/sessionApi';
import { PermissionsPanel } from './PermissionsPanel';
import { PasswordModal } from './PasswordModal';
import { SessionPermission } from '@/types/session';

interface OwnerControlsProps {
  slug: string;
  ownerToken: string;
  permission: SessionPermission;
  deviceLimit: number;
  deviceCount: number;
  hasPassword: boolean;
  onPermissionChange: (permission: SessionPermission) => void;
  onDeviceLimitChange: (limit: number) => void;
  onDeleteSession: () => void;
  className?: string;
}

export function OwnerControls({
  slug,
  ownerToken,
  permission,
  deviceLimit,
  deviceCount,
  hasPassword,
  onPermissionChange,
  onDeviceLimitChange,
  onDeleteSession,
  className,
}: OwnerControlsProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'permissions' | 'security'>('qr');

  const handlePasswordSave = useCallback(
    async (password: string | null) => {
      await sessionApi.updatePassword(slug, { password, ownerToken });
    },
    [slug, ownerToken],
  );

  const handleClearContent = useCallback(async () => {
    await sessionApi.updateContent(slug, { content: '', ownerToken });
  }, [slug, ownerToken]);

  return (
    <aside
      className={`flex flex-col h-full w-72 rounded-r-xl border-r border-outline-variant dark:border-outline shadow-sm bg-surface-container-low dark:bg-on-surface p-md space-y-lg flex-shrink-0 z-40 ${className || ''}`}
    >
      <nav className="flex-1 space-y-2">
        <a
          className={`flex items-center gap-3 pl-4 py-3 rounded-r-lg transition-all cursor-pointer ${
            activeTab === 'qr'
              ? 'text-primary dark:text-primary-fixed-dim font-bold border-l-4 border-primary dark:border-primary-fixed-dim bg-secondary-container dark:bg-secondary-fixed-variant'
              : 'text-on-secondary-container dark:text-secondary-fixed-dim hover:bg-secondary-container dark:hover:bg-secondary-fixed-variant'
          }`}
          onClick={() => setActiveTab('qr')}
        >
          <span className="material-symbols-outlined">qr_code_2</span>
          <span className="font-label-md text-label-md">QR Code</span>
        </a>

        <a
          className={`flex items-center gap-3 pl-4 py-3 rounded-r-lg transition-all cursor-pointer ${
            activeTab === 'permissions'
              ? 'text-primary dark:text-primary-fixed-dim font-bold border-l-4 border-primary dark:border-primary-fixed-dim bg-secondary-container dark:bg-secondary-fixed-variant'
              : 'text-on-secondary-container dark:text-secondary-fixed-dim hover:bg-secondary-container dark:hover:bg-secondary-fixed-variant'
          }`}
          onClick={() => setActiveTab('permissions')}
        >
          <span className="material-symbols-outlined">lock</span>
          <span className="font-label-md text-label-md">Permissões</span>
        </a>

        {activeTab === 'permissions' && (
          <div className="pl-12 pr-4 pb-2">
            <PermissionsPanel
              permission={permission}
              deviceLimit={deviceLimit}
              deviceCount={deviceCount}
              onPermissionChange={onPermissionChange}
              onDeviceLimitChange={onDeviceLimitChange}
            />
          </div>
        )}

        <a
          className={`flex items-center gap-3 pl-4 py-3 rounded-r-lg transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'text-primary dark:text-primary-fixed-dim font-bold border-l-4 border-primary dark:border-primary-fixed-dim bg-secondary-container dark:bg-secondary-fixed-variant'
              : 'text-on-secondary-container dark:text-secondary-fixed-dim hover:bg-secondary-container dark:hover:bg-secondary-fixed-variant'
          }`}
          onClick={() => setActiveTab('security')}
        >
          <span className="material-symbols-outlined">shield</span>
          <span className="font-label-md text-label-md">Segurança</span>
        </a>

        {activeTab === 'security' && (
          <div className="pl-12 pr-4 pb-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Proteger com senha
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={hasPassword}
                  onChange={() => setShowPasswordModal(true)}
                />
                <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>
        )}

        <button
          onClick={handleClearContent}
          className="flex items-center gap-3 text-on-secondary-container dark:text-secondary-fixed-dim pl-4 py-3 hover:bg-secondary-container dark:hover:bg-secondary-fixed-variant rounded-r-lg transition-all w-full text-left"
        >
          <span className="material-symbols-outlined">clear_all</span>
          <span className="font-label-md text-label-md">Limpar conteúdo</span>
        </button>

        <button
          onClick={onDeleteSession}
          className="flex items-center gap-3 text-error pl-4 py-3 hover:bg-error-container rounded-r-lg transition-all w-full text-left"
        >
          <span className="material-symbols-outlined">delete</span>
          <span className="font-label-md text-label-md">Excluir sessão</span>
        </button>
      </nav>

      <PasswordModal
        isOpen={showPasswordModal}
        currentPassword={hasPassword ? '••••••' : null}
        onSave={handlePasswordSave}
        onClose={() => setShowPasswordModal(false)}
      />
    </aside>
  );
}
