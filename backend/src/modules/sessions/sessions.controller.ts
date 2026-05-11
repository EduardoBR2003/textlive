import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { OwnerActionDto } from './dto/owner-action.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async createSession(@Body() dto: CreateSessionDto) {
    const session = await this.sessionsService.createSession(dto);
    return {
      slug: session.slug,
      ownerToken: session.ownerToken,
      permission: session.permission,
      deviceLimit: session.deviceLimit,
      hasPassword: !!session.password,
      expiresAt: session.expiresAt,
    };
  }

  @Get(':slug/verify')
  async verifySession(@Param('slug') slug: string) {
    return this.sessionsService.verifySession(slug);
  }

  @Get(':slug')
  async getSession(@Param('slug') slug: string) {
    const session = await this.sessionsService.getSessionBySlug(slug);
    return {
      slug: session.slug,
      content: session.content,
      permission: session.permission,
      deviceLimit: session.deviceLimit,
      hasPassword: !!session.password,
      deviceCount: session.devices.length,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    };
  }

  @Post(':slug/join')
  @HttpCode(HttpStatus.OK)
  async joinSession(@Param('slug') slug: string, @Body() dto: JoinSessionDto) {
    const session = await this.sessionsService.joinSession(slug, dto);
    return {
      slug: session.slug,
      content: session.content,
      permission: session.permission,
      deviceLimit: session.deviceLimit,
      hasPassword: !!session.password,
      deviceCount: session.devices.length,
      expiresAt: session.expiresAt,
    };
  }

  @Patch(':slug/content')
  async updateContent(
    @Param('slug') slug: string,
    @Body() dto: UpdateContentDto,
  ) {
    const session = await this.sessionsService.updateContent(slug, dto);
    return {
      slug: session.slug,
      content: session.content,
      updatedAt: session.updatedAt,
    };
  }

  @Patch(':slug/permissions')
  async updatePermissions(
    @Param('slug') slug: string,
    @Body() dto: UpdatePermissionsDto,
  ) {
    const session = await this.sessionsService.updatePermissions(slug, dto);
    return {
      slug: session.slug,
      permission: session.permission,
      deviceLimit: session.deviceLimit,
    };
  }

  @Patch(':slug/password')
  async updatePassword(
    @Param('slug') slug: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    const session = await this.sessionsService.updatePassword(slug, dto);
    return {
      slug: session.slug,
      hasPassword: !!session.password,
    };
  }

  @Post(':slug/owner/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOwner(
    @Param('slug') slug: string,
    @Body() dto: OwnerActionDto,
  ) {
    return this.sessionsService.verifyOwner(slug, dto.ownerToken);
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(
    @Param('slug') slug: string,
    @Body() dto: OwnerActionDto,
  ) {
    await this.sessionsService.deleteSession(slug, dto.ownerToken);
  }

  @Get(':slug/devices')
  async getDeviceCount(@Param('slug') slug: string) {
    const count = await this.sessionsService.getDeviceCount(slug);
    return { count };
  }
}
