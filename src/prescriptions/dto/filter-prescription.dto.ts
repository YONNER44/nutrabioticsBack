import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PrescriptionStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterPrescriptionDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  patientId?: string;
}
