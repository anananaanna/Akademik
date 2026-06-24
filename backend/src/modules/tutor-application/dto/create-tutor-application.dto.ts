import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateTutorApplicationDto {
  @IsString()
  @IsNotEmpty({ message: 'Motivation must not be empty' })
  @MinLength(50, { message: 'Motivation must be at least 50 characters' })
  @MaxLength(2000, { message: 'Motivation must not exceed 2000 characters' })
  motivation: string;
}