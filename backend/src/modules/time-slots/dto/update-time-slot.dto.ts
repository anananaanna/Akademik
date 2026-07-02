import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TimeSlotStatus } from '../entities/time-slot.entity';

export class UpdateTimeSlotDto {
  @IsOptional()
  @IsDateString({}, { message: 'startTime must be a valid ISO 8601 date string' })
  startTime?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endTime must be a valid ISO 8601 date string' })
  endTime?: string;

  @IsOptional()
  @IsEnum(TimeSlotStatus, {
    message: `Status must be one of: ${Object.values(TimeSlotStatus).join(', ')}`,
  })
  status?: TimeSlotStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes must not exceed 500 characters' })
  notes?: string;
}