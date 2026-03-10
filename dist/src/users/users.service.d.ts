import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findAll(role?: Role, query?: string, page?: number, limit?: number): Promise<{
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
    findDoctors(page?: number, limit?: number): Promise<{
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
    findPatients(page?: number, limit?: number): Promise<{
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
