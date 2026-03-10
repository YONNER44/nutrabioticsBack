import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { JwtPayload } from '../common/interfaces/request-with-user.interface';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        user: {
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
                birthDate: Date | null;
            } | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(user: JwtPayload): Promise<{
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
            birthDate: Date | null;
        } | null;
    }>;
}
