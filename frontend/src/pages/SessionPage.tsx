import React, { useCallback, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { useSessionPermissions } from '@/hooks/useSessionPermissions';
import { useDeviceToken } from '@/hooks/useDeviceToken';
import { sessionApi } from '@/services/sessionApi';
import { Header } from '@/components/Header';
import { SessionEditor } from '@/components/SessionEditor';
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
  const [hasPassword, setHasPassword] = useState(false);
  const [mobileTab, setMobileTab] = useState<'link' | 'permissions'>('link');

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

  const handlePasswordChanged = useCallback(
    (newHasPassword: boolean) => {
      setHasPassword(newHasPassword);
    },
    [],
  );

  if (session.isLoading) {
    return <LoadingState />;
  }

  if (session.error && session.error.includes('Limite')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-md">
        <main className="w-full max-w-sm mx-auto flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-8 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-outline" style={{ fontSize: '40px' }}>
              devices_fold
            </span>
          </div>
          <div className="space-y-4 mb-10">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Limite de dispositivos
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Esta sessão já atingiu o número máximo de dispositivos conectados ({session.deviceLimit}).
            </p>
          </div>
          <div className="w-full flex flex-col items-center space-y-6">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 px-6 rounded-xl hover:bg-on-primary-fixed-variant transition-colors shadow-sm active:scale-95 duration-150"
            >
              Criar nova sessão
            </button>
            <button
              onClick={() => navigate('/')}
              className="font-label-md text-label-md text-secondary hover:text-primary transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isOwner = !!ownerToken;

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
              hasPassword={hasPassword || session.hasPassword}
              onPermissionChange={handlePermissionChange}
              onDeviceLimitChange={handleDeviceLimitChange}
              onPasswordChanged={handlePasswordChanged}
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
              <div className="bg-surface-container rounded-lg border border-outline-variant p-4 text-center">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {session.permission === SessionPermission.EDIT
                    ? 'Você pode editar o texto'
                    : 'Somente visualização'}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-outline-variant p-4 space-y-2">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">devices</span>
                <span className="font-label-sm text-label-sm">
                  {session.deviceCount} de {session.deviceLimit} dispositivos
                </span>
              </div>
            </div>
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
          <span className="material-symbols-outlined">devices</span>
          <span className="font-label-sm text-label-sm mt-1">Info</span>
        </button>
        <button
          onClick={() => setMobileTab('permissions')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${mobileTab === 'permissions' ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary scale-90' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-inverse-surface'}`}
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
          <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
            <span className="material-symbols-outlined text-[20px]">devices</span>
            <span>{session.deviceCount} de {session.deviceLimit} dispositivos</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">
            {session.permission === SessionPermission.EDIT
              ? 'Permissão: Editar'
              : 'Permissão: Somente visualizar'}
          </p>
        </div>
      )}

      {mobileTab === 'permissions' && (
        <div className="md:hidden fixed bottom-16 left-0 w-full bg-surface border-t border-outline-variant p-md z-50">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-secondary-container text-on-secondary-container rounded-lg font-label-md text-label-md hover:bg-secondary-fixed-dim transition-colors"
            >
              Sair da sessão
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
