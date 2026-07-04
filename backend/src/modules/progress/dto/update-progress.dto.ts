import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProgressDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'topicsCovered must not be empty' })
  topicsCovered?: string;

  @IsOptional()
  @IsString()
  homeworkAssigned?: string;

  @IsOptional()
  @IsString()
  tutorNotes?: string;
}