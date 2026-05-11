import { useMemo } from 'react';
import { generateLocalDeviceId } from '@/utils/generateLocalDeviceId';

export function useDeviceToken(): string {
  return useMemo(() => generateLocalDeviceId(), []);
}
