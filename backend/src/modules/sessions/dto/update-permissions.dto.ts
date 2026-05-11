import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { SessionPermission } from '../types/session.types';

export class UpdatePermissionsDto {
  @IsOptional()
  @IsEnum(SessionPermission)
  permission?: SessionPermission;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  deviceLimit?: number;

  @IsString()
  ownerToken: string;
}
