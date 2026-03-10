import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<{
        doctor: {
            id: string;
            specialty: string | null;
            userId: string;
        } | null;
        patient: {
            id: string;
            birthDate: Date | null;
            userId: string;
        } | null;
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findAll(role?: Role, query?: string, pagination?: PaginationDto): Promise<{
        data: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            doctor: {
                id: string;
                specialty: string | null;
            } | null;
            patient: {
                id: string;
            } | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        doctor: {
            id: string;
            specialty: string | null;
            userId: string;
        } | null;
        patient: {
            id: string;
            birthDate: Date | null;
            userId: string;
        } | null;
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
