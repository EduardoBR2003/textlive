import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @IsOptional()
  @IsString()
  @Matches(/^.{4,64}$/, { message: 'Senha deve ter entre 4 e 64 caracteres' })
  password?: string | null;

  @IsString()
  ownerToken: string;
}
