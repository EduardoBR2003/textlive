import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  GoneException,
} from '@nestjs/common';
import { SessionsRepository } from './sessions.repository';
import { Session } from './entities/session.entity';
import { SessionPermission } from './types/session.types';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  private async validateSessionNotExpired(session: Session): Promise<void> {
    if (this.sessionsRepository.isExpired(session)) {
      await this.sessionsRepository.delete(session.id);
      throw new GoneException('Sessão expirada ou não encontrada');
    }
  }

  async createSession(dto: CreateSessionDto): Promise<Session> {
    return this.sessionsRepository.create({
      password: dto.password,
      permission: dto.permission,
      deviceLimit: dto.deviceLimit,
    });
  }

  async getSessionBySlug(slug: string): Promise<Session> {
    const session = await this.sessionsRepository.findBySlug(slug);
    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }
    await this.validateSessionNotExpired(session);
    return session;
  }

  async verifySession(slug: string): Promise<{ exists: boolean; hasPassword: boolean }> {
    const session = await this.sessionsRepository.findBySlug(slug);
    if (!session) {
      return { exists: false, hasPassword: false };
    }
    if (this.sessionsRepository.isExpired(session)) {
      await this.sessionsRepository.delete(session.id);
      return { exists: false, hasPassword: false };
    }
    return { exists: true, hasPassword: !!session.password };
  }

  async joinSession(slug: string, dto: JoinSessionDto & { ownerToken?: string }): Promise<Session> {
    const session = await this.sessionsRepository.findBySlug(slug);
    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    await this.validateSessionNotExpired(session);

    if (session.password && session.password !== dto.password) {
      throw new ForbiddenException('Senha incorreta');
    }

    const isOwner = dto.ownerToken && session.ownerToken === dto.ownerToken;
    if (isOwner) {
      return session;
    }

    const result = await this.sessionsRepository.addDevice(
      session.id,
      dto.deviceId,
      session.deviceLimit,
    );

    if (result.blocked) {
      throw new ConflictException('Limite de dispositivos atingido');
    }

    return result.session!;
  }

  async updateContent(slug: string, dto: UpdateContentDto & { deviceId?: string }): Promise<Session> {
    const session = await this.sessionsRepository.findBySlug(slug);
    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    await this.validateSessionNotExpired(session);

    const isOwner = dto.ownerToken && session.ownerToken === dto.ownerToken;
    const isGuest = dto.deviceId && session.devices.some((d) => d.deviceId === dto.deviceId);

    if (isOwner) {
      // Dono sempre pode editar
    } else if (isGuest && session.permission === SessionPermission.EDIT) {
      // Guest pode editar se permissão for EDIT
    } else if (isGuest && session.permission !== SessionPermission.EDIT) {
      throw new ForbiddenException('Permissão de edição desabilitada');
    } else {
      throw new ForbiddenException('Sem permissão para editar');
    }

    const updated = await this.sessionsRepository.updateContent(session.id, dto.content);
    return updated!;
  }

  async updatePermissions(slug: string, dto: UpdatePermissionsDto): Promise<Session> {
    const session = await this.sessionsRepository.findBySlug(slug);
    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    await this.validateSessionNotExpired(session);

    if (session.ownerToken !== dto.ownerToken) {
      throw new ForbiddenException('Apenas o dono pode alterar permissões');
    }

    const updated = await this.sessionsRepository.updatePermissions(session.id, {
      permission: dto.permission,
      deviceLimit: dto.deviceLimit,
    });
    return updated!;
  }

  async updatePassword(slug: string, dto: UpdatePasswordDto): Promise<Session> {
    const session = await this.sessionsRepository.findBySlug(slug);
    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    await this.validateSessionNotExpired(session);

    if (session.ownerToken !== dto.ownerToken) {
      throw new ForbiddenException('Apenas o dono pode alterar a senha');
    }

    const updated = await this.sessionsRepository.updatePassword(
      session.id,
      dto.password ?? null,
    );
    return updated!;
  }

  async deleteSession(slug: string, ownerToken: string): Promise<void> {
    const session = await this.sessionsRepository.findBySlug(slug);
    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    if (session.ownerToken !== ownerToken) {
      throw new ForbiddenException('Apenas o dono pode excluir a sessão');
    }

    await this.sessionsRepository.delete(session.id);
  }

  async verifyOwner(slug: string, ownerToken: string): Promise<{ valid: boolean }> {
    const session = await this.sessionsRepository.findBySlug(slug);
    if (!session) {
      return { valid: false };
    }
    return { valid: session.ownerToken === ownerToken };
  }

  async leaveSession(slug: string, deviceId: string): Promise<Session> {
    const session = await this.sessionsRepository.findBySlug(slug);
    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    const updated = await this.sessionsRepository.removeDevice(session.id, deviceId);
    return updated!;
  }

  async getDeviceCount(slug: string): Promise<number> {
    const session = await this.sessionsRepository.findBySlug(slug);
    if (!session) return 0;
    return this.sessionsRepository.getDeviceCount(session);
  }
}
