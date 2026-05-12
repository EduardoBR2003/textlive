import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { SessionPermission } from './types/session.types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repo: Repository<Session>,
  ) {}

  private generateSlug(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    for (let i = 0; i < 6; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
  }

  async create(data: {
    password?: string;
    permission?: SessionPermission;
    deviceLimit?: number;
    expiresInHours?: number;
  }): Promise<Session> {
    const now = new Date();
    const expiresInHours = data.expiresInHours ?? 24;

    const session = this.repo.create({
      id: uuidv4(),
      slug: await this.generateUniqueSlug(),
      content: '',
      password: data.password ?? null,
      permission: data.permission ?? SessionPermission.EDIT,
      deviceLimit: data.deviceLimit ?? 2,
      ownerToken: uuidv4(),
      devices: [],
      expiresAt: new Date(now.getTime() + expiresInHours * 60 * 60 * 1000),
    });

    return this.repo.save(session);
  }

  private async generateUniqueSlug(): Promise<string> {
    for (let attempts = 0; attempts < 10; attempts++) {
      const slug = this.generateSlug();
      const exists = await this.repo.findOne({ where: { slug } });
      if (!exists) return slug;
    }
    return this.generateSlug();
  }

  async findBySlug(slug: string): Promise<Session | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async findById(id: string): Promise<Session | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updateContent(id: string, content: string): Promise<Session | null> {
    await this.repo.update(id, { content });
    return this.findById(id);
  }

  async updatePermissions(
    id: string,
    data: { permission?: SessionPermission; deviceLimit?: number },
  ): Promise<Session | null> {
    const updateData: Partial<Session> = {};
    if (data.permission !== undefined) updateData.permission = data.permission;
    if (data.deviceLimit !== undefined) updateData.deviceLimit = data.deviceLimit;
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  async updatePassword(id: string, password: string | null): Promise<Session | null> {
    await this.repo.update(id, { password });
    return this.findById(id);
  }

  async addDevice(sessionId: string, deviceId: string, limit: number): Promise<{
    session: Session | null;
    blocked: boolean;
  }> {
    const existing = await this.repo.findOne({
      where: { id: sessionId },
      select: ['devices'],
    });
    if (!existing) return { session: null, blocked: false };

    if (existing.devices.some((d) => d.deviceId === deviceId)) {
      const session = await this.findById(sessionId);
      return { session, blocked: false };
    }

    const newDevice = JSON.stringify([{ deviceId, joinedAt: new Date().toISOString() }]);
    const result = await this.repo.query(
      `UPDATE sessions
       SET devices = devices::jsonb || $1::jsonb
       WHERE id = $2 AND jsonb_array_length(devices::jsonb) < $3
       RETURNING id`,
      [newDevice, sessionId, limit],
    );

    const affected = result[1] as number;
    if (affected === 0) {
      return { session: null, blocked: true };
    }

    const session = await this.findById(sessionId);
    return { session, blocked: false };
  }

  async removeDevice(sessionId: string, deviceId: string): Promise<Session | null> {
    const session = await this.findById(sessionId);
    if (!session) return null;

    session.devices = session.devices.filter((d) => d.deviceId !== deviceId);
    await this.repo.update(sessionId, { devices: session.devices });
    return this.findById(sessionId);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  getDeviceCount(session: Session): number {
    return session.devices?.length ?? 0;
  }

  isExpired(session: Session): boolean {
    return new Date() > session.expiresAt;
  }
}
