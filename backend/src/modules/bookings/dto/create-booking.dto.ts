import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @IsUUID('4', { message: 'advertisementId must be a valid UUID' })
  advertisementId: string;

  @IsUUID('4', { message: 'timeSlotId must be a valid UUID' })
  timeSlotId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes must not exceed 500 characters' })
  notes?: string;
}