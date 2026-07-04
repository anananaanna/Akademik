import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProgressDto {
  @IsUUID('4', { message: 'bookingId must be a valid UUID' })
  bookingId: string;

  @IsString()
  @IsNotEmpty({ message: 'topicsCovered must not be empty' })
  topicsCovered: string;

  @IsOptional()
  @IsString()
  homeworkAssigned?: string;

  @IsOptional()
  @IsString()
  tutorNotes?: string;
}