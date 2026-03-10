import { Role } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    role: Role;
    specialty?: string;
    birthDate?: string;
}
