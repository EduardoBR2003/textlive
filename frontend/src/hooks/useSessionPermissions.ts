import { useState, useCallback, useEffect } from 'react';
import { SessionPermission } from '@/types/session';
import { sessionApi } from '@/services/sessionApi';

interface UseSessionPermissionsOptions {
  slug: string;
  ownerToken: string;
  initialPermission: SessionPermission;
  initialDeviceLimit: number;
}

export function useSessionPermissions({
  slug,
  ownerToken,
  initialPermission,
  initialDeviceLimit,
}: UseSessionPermissionsOptions) {
  const [permission, setPermission] = useState<SessionPermission>(initialPermission);
  const [deviceLimit, setDeviceLimit] = useState<number>(initialDeviceLimit);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setPermission(initialPermission);
  }, [initialPermission]);

  useEffect(() => {
    setDeviceLimit(initialDeviceLimit);
  }, [initialDeviceLimit]);

  const updatePermission = useCallback(
    async (newPermission: SessionPermission) => {
      if (!ownerToken) return;
      setIsUpdating(true);
      try {
        await sessionApi.updatePermissions(slug, {
          permission: newPermission,
          ownerToken,
        });
        setPermission(newPermission);
      } catch (error) {
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [slug, ownerToken],
  );

  const updateDeviceLimit = useCallback(
    async (newLimit: number) => {
      if (!ownerToken || newLimit < 1 || newLimit > 20) return;
      setIsUpdating(true);
      try {
        await sessionApi.updatePermissions(slug, {
          deviceLimit: newLimit,
          ownerToken,
        });
        setDeviceLimit(newLimit);
      } catch (error) {
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [slug, ownerToken],
  );

  return {
    permission,
    setPermission,
    deviceLimit,
    setDeviceLimit,
    isUpdating,
    updatePermission,
    updateDeviceLimit,
  };
}
