import { UsersService } from '../users/users.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class DoctorsController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(pagination: PaginationDto): Promise<{
        data: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            doctor: {
                id: string;
                specialty: string | null;
            } | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
