import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { useSessionPermissions } from '@/hooks/useSessionPermissions';
import { useDeviceToken } from '@/hooks/useDeviceToken';
import { sessionApi } from '@/services/sessionApi';
import { formatSessionUrl } from '@/utils/formatSessionUrl';
import { Header } from '@/components/Header';
import { SessionEditor } from '@/components/SessionEditor';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import { CopyTextButton } from '@/components/CopyTextButton';
import { QRCodeCard } from '@/components/QRCodeCard';
import { OwnerControls } from '@/components/OwnerControls';
import { LoadingState } from '@/components/LoadingState';
import { SessionPermission } from '@/types/session';

export function SessionPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const deviceId = useDeviceToken();

  const [ownerToken, setOwnerToken] = useState<string | undefined>(
    () =>
      (location.state as { ownerToken?: string })?.ownerToken ||
      localStorage.getItem(`textlive_owner_${slug}`) ||
      undefined,
  );
  const [showSidebar, setShowSidebar] = useState(false);
  const [mobileTab, setMobileTab] = useState<'link' | 'permissions' | 'actions' | 'security'>('link');

  const sessionUrl = slug ? formatSessionUrl(slug) : '';

  const session = useSession({
    slug: slug || '',
    ownerToken,
  });

  const {
    permission,
    deviceLimit,
    updatePermission,
    updateDeviceLimit,
  } = useSessionPermissions({
    slug: slug || '',
    ownerToken: ownerToken || '',
    initialPermission: session.permission,
    initialDeviceLimit: session.deviceLimit,
  });

  const handleDeleteSession = useCallback(async () => {
    if (!slug || !ownerToken) return;
    try {
      await sessionApi.deleteSession(slug, ownerToken);
      localStorage.removeItem(`textlive_owner_${slug}`);
      navigate('/');
    } catch {
      // Erro silencioso
    }
  }, [slug, ownerToken, navigate]);

  const handlePermissionChange = useCallback(
    async (newPermission: SessionPermission) => {
      try {
        await updatePermission(newPermission);
      } catch {
        // Erro silencioso
      }
    },
    [updatePermission],
  );

  const handleDeviceLimitChange = useCallback(
    async (newLimit: number) => {
      try {
        await updateDeviceLimit(newLimit);
      } catch {
        // Erro silencioso
      }
    },
    [updateDeviceLimit],
  );

  if (session.isLoading) {
    return <LoadingState />;
  }

  const isOwner = !!ownerToken;

  const sessionUrlDisplay = `textlive.com/${slug}`;

  return (
    <div className="bg-background text-on-background font-body-md h-screen overflow-hidden flex flex-col">
      <Header
        isOwner={isOwner}
        deviceCount={session.deviceCount}
        isSynced={session.isSynced}
        isSaving={session.isSaving}
      />

      <div className="flex flex-1 overflow-hidden">
        {isOwner && (
          <div className="hidden md:block">
            <OwnerControls
              slug={slug || ''}
              ownerToken={ownerToken || ''}
              permission={permission}
              deviceLimit={deviceLimit}
              deviceCount={session.deviceCount}
              hasPassword={session.hasPassword}
              onPermissionChange={handlePermissionChange}
              onDeviceLimitChange={handleDeviceLimitChange}
              onDeleteSession={handleDeleteSession}
            />
          </div>
        )}

        {!isOwner && (
          <div className="hidden md:flex md:flex-col h-full w-72 rounded-r-xl border-r border-outline-variant shadow-sm bg-surface-container-low p-md space-y-lg flex-shrink-0">
            <div className="space-y-sm">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Sessão Ativa
              </p>
              <CopyTextButton text={sessionUrlDisplay} />
              <CopyLinkButton url={sessionUrl} />
            </div>
            <QRCodeCard url={sessionUrl} className="mt-lg" />
            <div className="mt-auto">
              <button
                onClick={() => navigate('/')}
                className="w-full py-2 bg-secondary-container text-on-secondary-container rounded-lg font-label-md text-label-md hover:bg-secondary-fixed-dim transition-colors"
              >
                Sair da sessão
              </button>
            </div>
          </div>
        )}

        <SessionEditor
          content={session.content}
          permission={permission}
          isOwner={isOwner}
          onChange={session.setContent}
        />
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 pb-safe bg-surface dark:bg-on-surface rounded-t-xl border-t border-outline-variant dark:border-outline shadow-lg flex-shrink-0 z-50">
        <button
          onClick={() => setMobileTab('link')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${mobileTab === 'link' ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary scale-90' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-inverse-surface'}`}
        >
          <span className="material-symbols-outlined">share</span>
          <span className="font-label-sm text-label-sm mt-1">Link</span>
        </button>
        <button
          onClick={() => setMobileTab('permissions')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${mobileTab === 'permissions' ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary scale-90' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-inverse-surface'}`}
        >
          <span className="material-symbols-outlined">lock</span>
          <span className="font-label-sm text-label-sm mt-1">Permissões</span>
        </button>
        <button
          onClick={() => setMobileTab('actions')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${mobileTab === 'actions' ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary scale-90' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-inverse-surface'}`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-sm text-label-sm mt-1">Ações</span>
        </button>
        {isOwner && (
          <button
            onClick={handleDeleteSession}
            className="flex flex-col items-center justify-center text-error px-4 py-1 hover:bg-error-container rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">delete</span>
            <span className="font-label-sm text-label-sm mt-1">Excluir</span>
          </button>
        )}
      </nav>

      {mobileTab === 'link' && (
        <div className="md:hidden fixed bottom-16 left-0 w-full bg-surface border-t border-outline-variant p-md z-50">
          <CopyTextButton text={sessionUrlDisplay} />
          <CopyLinkButton url={sessionUrl} className="mt-sm" />
        </div>
      )}

      {mobileTab === 'permissions' && (
        <div className="md:hidden fixed bottom-16 left-0 w-full bg-surface border-t border-outline-variant p-md z-50">
          <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md mb-sm">
            <span className="material-symbols-outlined text-[20px]">devices</span>
            {session.deviceCount} dispositivos conectados
          </div>
        </div>
      )}
    </div>
  );
}
