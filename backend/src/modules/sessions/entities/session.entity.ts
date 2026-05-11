import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SessionPermission } from '../types/session.types';

@Entity('sessions')
export class Session {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  slug: string;

  @Column({ type: 'text', default: '' })
  content: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  password: string | null;

  @Column({ type: 'enum', enum: SessionPermission, default: SessionPermission.EDIT })
  permission: SessionPermission;

  @Column({ type: 'int', default: 5 })
  deviceLimit: number;

  @Column({ type: 'uuid' })
  ownerToken: string;

  @Column('simple-json', { default: '[]' })
  devices: { deviceId: string; joinedAt: string }[];

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
