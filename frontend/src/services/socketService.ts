import { io, Socket } from 'socket.io-client';
import type { SessionPermission } from '@/types/session';

export interface SessionJoinedEvent {
  slug: string;
  content: string;
  permission: SessionPermission;
  hasPassword: boolean;
  deviceCount: number;
  deviceLimit: number;
  isOwner: boolean;
}

export interface ContentUpdatedEvent {
  slug: string;
  content: string;
  updatedAt: string;
}

export interface ContentSavedEvent {
  slug: string;
  updatedAt: string;
}

export interface DeviceCountChangedEvent {
  slug: string;
  count: number;
}

export interface SessionStateEvent {
  slug: string;
  content: string;
  permission: SessionPermission;
  hasPassword: boolean;
  deviceCount: number;
  deviceLimit: number;
}

export interface ErrorEvent {
  code: number;
  message: string;
}

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io('/sessions', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  joinSession(data: {
    slug: string;
    deviceId: string;
    password?: string;
    ownerToken?: string;
  }): void {
    this.socket?.emit('join-session', data);
  }

  leaveSession(data: { slug: string; deviceId: string }): void {
    this.socket?.emit('leave-session', data);
  }

  updateContent(data: {
    slug: string;
    content: string;
    ownerToken: string;
  }): void {
    this.socket?.emit('update-content', data);
  }

  requestSessionState(slug: string): void {
    this.socket?.emit('request-session-state', { slug });
  }

  onSessionJoined(callback: (data: SessionJoinedEvent) => void): () => void {
    this.socket?.on('session-joined', callback);
    return () => this.socket?.off('session-joined', callback);
  }

  onContentUpdated(callback: (data: ContentUpdatedEvent) => void): () => void {
    this.socket?.on('content-updated', callback);
    return () => this.socket?.off('content-updated', callback);
  }

  onContentSaved(callback: (data: ContentSavedEvent) => void): () => void {
    this.socket?.on('content-saved', callback);
    return () => this.socket?.off('content-saved', callback);
  }

  onDeviceCountChanged(
    callback: (data: DeviceCountChangedEvent) => void,
  ): () => void {
    this.socket?.on('device-count-changed', callback);
    return () => this.socket?.off('device-count-changed', callback);
  }

  onSessionState(callback: (data: SessionStateEvent) => void): () => void {
    this.socket?.on('session-state', callback);
    return () => this.socket?.off('session-state', callback);
  }

  onParticipantDisconnected(
    callback: (data: { slug: string; socketId: string }) => void,
  ): () => void {
    this.socket?.on('participant-disconnected', callback);
    return () => this.socket?.off('participant-disconnected', callback);
  }

  onError(callback: (data: ErrorEvent) => void): () => void {
    this.socket?.on('error', callback);
    return () => this.socket?.off('error', callback);
  }
}

export const socketService = new SocketService();
