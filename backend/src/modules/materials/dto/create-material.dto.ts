import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUrl({}, { message: 'fileUrl must be a valid URL' })
  @MaxLength(500, { message: 'fileUrl must not exceed 500 characters' })
  fileUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'fileType must not exceed 50 characters' })
  fileType?: string;
}