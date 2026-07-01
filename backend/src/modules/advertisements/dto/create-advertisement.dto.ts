import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AdvertisementLevel,
  AdvertisementStatus,
} from '../entities/advertisement.entity';

export class CreateAdvertisementDto {
  @IsUUID('4', { message: 'subjectId must be a valid UUID' })
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Hourly rate must be a number with up to 2 decimal places' },
  )
  @Min(0, { message: 'Hourly rate must be a positive number' })
  hourlyRate: number;

  @IsOptional()
  @IsEnum(AdvertisementLevel, {
    message: `Level must be one of: ${Object.values(AdvertisementLevel).join(', ')}`,
  })
  level?: AdvertisementLevel;

  @IsOptional()
  @IsEnum(AdvertisementStatus, {
    message: `Status must be one of: ${Object.values(AdvertisementStatus).join(', ')}`,
  })
  status?: AdvertisementStatus;
}