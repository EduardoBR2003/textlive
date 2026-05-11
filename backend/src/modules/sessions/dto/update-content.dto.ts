import { IsString } from 'class-validator';

export class UpdateContentDto {
  @IsString()
  content: string;

  @IsString()
  ownerToken: string;
}
