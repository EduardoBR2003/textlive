import { IsString } from 'class-validator';

export class OwnerActionDto {
  @IsString()
  ownerToken: string;
}
