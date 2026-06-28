import { IsArray, IsUUID, ArrayUnique } from 'class-validator';

export class UpdateTutorSubjectsDto {
  @IsArray({ message: 'subjectIds must be an array' })
  @ArrayUnique({ message: 'subjectIds must not contain duplicate values' })
  @IsUUID('4', { each: true, message: 'Each subject ID must be a valid UUID' })
  subjectIds: string[];
}