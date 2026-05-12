import { IsString, IsOptional } from 'class-validator';

export class JoinSessionDto {
  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  deviceId: string;

  @IsOptional()
  @IsString()
  ownerToken?: string;
}
