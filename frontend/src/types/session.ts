export enum SessionPermission {
  VIEW = 'view',
  EDIT = 'edit',
}

export interface Session {
  slug: string;
  content: string;
  permission: SessionPermission;
  deviceLimit: number;
  hasPassword: boolean;
  deviceCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface SessionDevice {
  deviceId: string;
  joinedAt: string;
}

export interface CreateSessionResponse {
  slug: string;
  ownerToken: string;
  permission: SessionPermission;
  deviceLimit: number;
  hasPassword: boolean;
  expiresAt: string;
}

export interface JoinSessionResponse {
  slug: string;
  content: string;
  permission: SessionPermission;
  deviceLimit: number;
  hasPassword: boolean;
  deviceCount: number;
  expiresAt: string;
}

export interface VerifySessionResponse {
  exists: boolean;
  hasPassword: boolean;
}

export interface SessionState {
  slug: string;
  content: string;
  permission: SessionPermission;
  hasPassword: boolean;
  deviceCount: number;
  deviceLimit: number;
  isOwner?: boolean;
  ownerToken?: string;
  isLoading: boolean;
  error: string | null;
}
