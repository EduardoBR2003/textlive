import { useState, useCallback, useEffect, useRef } from 'react';
import { sessionApi } from '@/services/sessionApi';
import { useSessionSocket } from './useSessionSocket';
import { useDebounce } from './useDebounce';
import { useDeviceToken } from './useDeviceToken';
import { SessionPermission } from '@/types/session';
import type { SessionState } from '@/types/session';

interface UseSessionOptions {
  slug: string;
  ownerToken?: string;
  password?: string;
}

export function useSession({ slug, ownerToken, password }: UseSessionOptions) {
  const deviceId = useDeviceToken();
  const [state, setState] = useState<SessionState>({
    slug,
    content: '',
    permission: SessionPermission.EDIT,
    hasPassword: false,
    deviceCount: 0,
    deviceLimit: 2,
    isOwner: false,
    ownerToken,
    isLoading: true,
    error: null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [socketEnabled, setSocketEnabled] = useState(false);
  const localContentRef = useRef<string>('');
  const debouncedContent = useDebounce(state.content, 500);
  const mountedRef = useRef(false);

  const handleContentUpdated = useCallback((content: string) => {
    localContentRef.current = content;
    setState((prev) => ({ ...prev, content }));
  }, []);

  const handleDeviceCountChanged = useCallback((count: number) => {
    setState((prev) => ({ ...prev, deviceCount: count }));
  }, []);

  const handleError = useCallback((message: string) => {
    if (message.includes('Permissão')) return;
    setState((prev) => ({ ...prev, error: message }));
  }, []);

  const handlePermissionsChanged = useCallback(
    (newPermission: SessionPermission, newDeviceLimit: number) => {
      setState((prev) => ({ ...prev, permission: newPermission, deviceLimit: newDeviceLimit }));
    },
    [],
  );

  const handleSessionJoined = useCallback(
    (data: {
      content: string;
      permission: SessionPermission;
      deviceCount: number;
      deviceLimit: number;
      isOwner: boolean;
    }) => {
      if (!mountedRef.current) return;
      localContentRef.current = data.content;
      setState((prev) => ({
        ...prev,
        content: data.content,
        permission: data.permission,
        deviceCount: data.deviceCount,
        deviceLimit: data.deviceLimit,
        isOwner: data.isOwner || !!ownerToken,
        error: null,
      }));
    },
    [ownerToken],
  );

  const { updateContent } = useSessionSocket({
    slug,
    deviceId,
    ownerToken,
    password,
    enabled: socketEnabled,
    onContentUpdated: handleContentUpdated,
    onDeviceCountChanged: handleDeviceCountChanged,
    onContentSaved: () => {
      setIsSaving(false);
      setIsSynced(true);
      setTimeout(() => setIsSynced(false), 3000);
    },
    onError: handleError,
    onPermissionsChanged: handlePermissionsChanged,
    onSessionEnded: () => {
      setState((prev) => ({ ...prev, error: 'Sessão encerrada pelo dono' }));
    },
    onSessionJoined: handleSessionJoined,
  });

  const setContent = useCallback(
    (content: string) => {
      localContentRef.current = content;
      setState((prev) => ({ ...prev, content }));
      setIsSaving(true);
      setIsSynced(false);
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;

    const join = async () => {
      try {
        const result = await sessionApi.joinSession(slug, {
          deviceId,
          password,
          ownerToken,
        });
        if (!mountedRef.current) return;
        setSocketEnabled(true);
        localContentRef.current = result.content;
        setState((prev) => ({
          ...prev,
          slug: result.slug,
          content: result.content,
          permission: result.permission,
          deviceLimit: result.deviceLimit,
          hasPassword: result.hasPassword,
          deviceCount: result.deviceCount,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        if (!mountedRef.current) return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Erro ao entrar na sessão',
        }));
      }
    };

    join();

    const handleBeforeUnload = () => {
      if (ownerToken) {
        sessionApi.endSession(slug, ownerToken);
      } else {
        sessionApi.leaveSession(slug, deviceId);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (ownerToken) {
          sessionApi.endSession(slug, ownerToken);
        } else {
          sessionApi.leaveSession(slug, deviceId);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [slug, deviceId, password]);

  useEffect(() => {
    if (debouncedContent && socketEnabled) {
      updateContent(debouncedContent);
    }
  }, [debouncedContent, socketEnabled, updateContent]);

  return {
    ...state,
    isSaving,
    isSynced,
    setContent,
    setIsSynced,
  };
}
