import { UsersService } from '../users/users.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class PatientsController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(pagination: PaginationDto): Promise<{
        data: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            patient: {
                id: string;
                birthDate: Date | null;
            } | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
