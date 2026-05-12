import { IsString } from 'class-validator';

export class LeaveSessionDto {
  @IsString()
  deviceId: string;
}
