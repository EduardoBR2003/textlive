export enum SessionPermission {
  VIEW = 'view',
  EDIT = 'edit',
}

export interface SessionDeviceInfo {
  deviceId: string;
  joinedAt: Date;
}
