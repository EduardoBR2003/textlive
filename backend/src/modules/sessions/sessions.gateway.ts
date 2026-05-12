import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from './sessions.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';

interface JoinSessionPayload {
  slug: string;
  deviceId: string;
  password?: string;
  ownerToken?: string;
}

interface UpdateContentPayload {
  slug: string;
  content: string;
  ownerToken: string;
}

interface LeaveSessionPayload {
  slug: string;
  deviceId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/sessions',
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SessionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clientToSessions: Map<string, Set<string>> = new Map();

  constructor(private readonly sessionsService: SessionsService) {}

  handleConnection(client: Socket): void {
    this.clientToSessions.set(client.id, new Set());
  }

  handleDisconnect(client: Socket): void {
    const sessions = this.clientToSessions.get(client.id);
    if (sessions) {
      for (const slug of sessions) {
        this.server.to(slug).emit('participant-disconnected', {
          slug,
          socketId: client.id,
        });
      }
    }
    this.clientToSessions.delete(client.id);
  }

  @SubscribeMessage('join-session')
  async handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinSessionPayload,
  ): Promise<void> {
    try {
      const session = await this.sessionsService.joinSession(payload.slug, {
        deviceId: payload.deviceId,
        password: payload.password,
      });

      client.join(payload.slug);

      const sessions = this.clientToSessions.get(client.id);
      if (sessions) {
        sessions.add(payload.slug);
      }

      const isOwner = payload.ownerToken
        ? session.ownerToken === payload.ownerToken
        : false;

      client.emit('session-joined', {
        slug: session.slug,
        content: session.content,
        permission: session.permission,
        hasPassword: !!session.password,
        deviceCount: session.devices.length,
        deviceLimit: session.deviceLimit,
        isOwner,
      });

      this.server.to(payload.slug).emit('device-count-changed', {
        slug: payload.slug,
        count: session.devices.length,
      });
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      client.emit('error', {
        code: err.status || 500,
        message: err.message || 'Erro ao entrar na sessão',
      });
    }
  }

  @SubscribeMessage('leave-session')
  async handleLeaveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LeaveSessionPayload,
  ): Promise<void> {
    try {
      const session = await this.sessionsService.leaveSession(
        payload.slug,
        payload.deviceId,
      );

      client.leave(payload.slug);
      const sessions = this.clientToSessions.get(client.id);
      if (sessions) {
        sessions.delete(payload.slug);
      }

      this.server.to(payload.slug).emit('device-count-changed', {
        slug: payload.slug,
        count: session.devices.length,
      });
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      client.emit('error', {
        code: err.status || 500,
        message: err.message || 'Erro ao sair da sessão',
      });
    }
  }

  @SubscribeMessage('update-content')
  async handleUpdateContent(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UpdateContentPayload,
  ): Promise<void> {
    try {
      const session = await this.sessionsService.updateContent(payload.slug, {
        content: payload.content,
        ownerToken: payload.ownerToken,
      });

      client.broadcast
        .to(payload.slug)
        .emit('content-updated', {
          slug: payload.slug,
          content: session.content,
          updatedAt: session.updatedAt,
        });

      client.emit('content-saved', {
        slug: payload.slug,
        updatedAt: session.updatedAt,
      });
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      client.emit('error', {
        code: err.status || 500,
        message: err.message || 'Erro ao atualizar conteúdo',
      });
    }
  }

  @SubscribeMessage('request-session-state')
  async handleRequestSessionState(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { slug: string },
  ): Promise<void> {
    try {
      const session = await this.sessionsService.getSessionBySlug(payload.slug);
      client.emit('session-state', {
        slug: session.slug,
        content: session.content,
        permission: session.permission,
        hasPassword: !!session.password,
        deviceCount: session.devices.length,
        deviceLimit: session.deviceLimit,
      });
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      client.emit('error', {
        code: err.status || 500,
        message: err.message || 'Erro ao obter estado da sessão',
      });
    }
  }
}
