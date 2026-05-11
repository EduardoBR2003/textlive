import { IsString, IsOptional, IsEnum, IsInt, Min, Max, Matches } from 'class-validator';
import { SessionPermission } from '../types/session.types';

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  @Matches(/^.{4,64}$/, { message: 'Senha deve ter entre 4 e 64 caracteres' })
  password?: string;

  @IsOptional()
  @IsEnum(SessionPermission)
  permission?: SessionPermission;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  deviceLimit?: number;
}
