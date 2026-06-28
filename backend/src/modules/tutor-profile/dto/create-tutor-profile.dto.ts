import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsInt,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTutorProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Hourly rate must be a number with up to 2 decimal places' })
  @Min(0, { message: 'Hourly rate must be a positive number' })
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  education?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Experience years must be a whole number' })
  @Min(0, { message: 'Experience years cannot be negative' })
  @Max(60, { message: 'Experience years must be 60 or less' })
  experienceYears?: number;

  @IsOptional()
  @IsUrl({}, { message: 'Profile photo must be a valid URL' })
  @MaxLength(500)
  profilePhotoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}