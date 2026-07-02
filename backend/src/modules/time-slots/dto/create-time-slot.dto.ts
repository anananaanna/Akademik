import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTimeSlotDto {
  @IsDateString({}, { message: 'startTime must be a valid ISO 8601 date string' })
  startTime: string;

  @IsDateString({}, { message: 'endTime must be a valid ISO 8601 date string' })
  endTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes must not exceed 500 characters' })
  notes?: string;
}