import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Subject name must not be empty' })
  @MaxLength(100, { message: 'Subject name must not exceed 100 characters' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}