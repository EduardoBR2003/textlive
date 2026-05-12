import { useEffect, useRef, useCallback } from 'react';
import { socketService } from '@/services/socketService';
import type { SessionPermission } from '@/types/session';

interface UseSessionSocketOptions {
  slug: string;
  deviceId: string;
  ownerToken?: string;
  password?: string;
  enabled: boolean;
  onContentUpdated: (content: string) => void;
  onDeviceCountChanged: (count: number) => void;
  onPermissionsChanged?: (permission: SessionPermission, deviceLimit: number) => void;
  onContentSaved?: () => void;
  onError: (message: string) => void;
  onSessionEnded?: () => void;
  onSessionJoined?: (data: {
    content: string;
    permission: SessionPermission;
    deviceCount: number;
    deviceLimit: number;
    isOwner: boolean;
  }) => void;
}

export function useSessionSocket({
  slug,
  deviceId,
  ownerToken,
  password,
  enabled,
  onContentUpdated,
    onDeviceCountChanged,
    onPermissionsChanged,
    onContentSaved,
    onError,
    onSessionEnded,
    onSessionJoined,
}: UseSessionSocketOptions) {
  const updateContent = useCallback(
    (content: string) => {
      if (ownerToken) {
        socketService.updateContent({ slug, content, ownerToken });
      } else {
        socketService.updateContent({ slug, content, deviceId });
      }
    },
    [slug, ownerToken, deviceId],
  );

  useEffect(() => {
    if (!enabled) return;

    const socket = socketService.connect();

    const unsub1 = socketService.onSessionJoined((data) => {
      if (data.slug === slug) {
        onSessionJoined?.({
          content: data.content,
          permission: data.permission,
          deviceCount: data.deviceCount,
          deviceLimit: data.deviceLimit,
          isOwner: data.isOwner,
        });
      }
    });

    const unsub2 = socketService.onContentUpdated((data) => {
      if (data.slug === slug) {
        onContentUpdated(data.content);
      }
    });

    const unsub3 = socketService.onDeviceCountChanged((data) => {
      if (data.slug === slug) {
        onDeviceCountChanged(data.count);
      }
    });

    const unsub4 = socketService.onContentSaved(() => {
      onContentSaved?.();
    });

    const unsub5 = socketService.onError((data) => {
      onError(data.message);
    });

    const unsub6 = socketService.onPermissionsChanged((data) => {
      if (data.slug === slug) {
        onPermissionsChanged?.(data.permission, data.deviceLimit);
      }
    });

    const unsub7 = socketService.onSessionEnded((data) => {
      if (data.slug === slug) {
        onSessionEnded?.();
      }
    });

    socketService.joinSession({
      slug,
      deviceId,
      password,
      ownerToken,
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
      unsub6();
      unsub7();
      socketService.leaveSession({ slug, deviceId });
    };
  }, [slug, deviceId, ownerToken, password, enabled]);

  return { updateContent };
}
