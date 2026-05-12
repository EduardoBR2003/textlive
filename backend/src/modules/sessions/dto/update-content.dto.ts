import { IsString, IsOptional } from 'class-validator';

export class UpdateContentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  ownerToken?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}
