import { IsString, IsNotEmpty, MaxLength, IsDateString } from 'class-validator';

export class ScheduleTweetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  text: string;

  @IsDateString()
  scheduledAt: string; // ISO date string
}
