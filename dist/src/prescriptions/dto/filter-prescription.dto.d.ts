import { PrescriptionStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class FilterPrescriptionDto extends PaginationDto {
    status?: PrescriptionStatus;
    from?: string;
    to?: string;
    doctorId?: string;
    patientId?: string;
}
