import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { FilterPrescriptionDto } from './dto/filter-prescription.dto';
import { JwtPayload } from '../common/interfaces/request-with-user.interface';
import { PdfService } from './pdf.service';
export declare class PrescriptionsService {
    private prisma;
    private pdfService;
    constructor(prisma: PrismaService, pdfService: PdfService);
    create(user: JwtPayload, dto: CreatePrescriptionDto): Promise<{
        patient: {
            user: {
                id: string;
                email: string;
                password: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            birthDate: Date | null;
            userId: string;
        };
        items: {
            id: string;
            name: string;
            dosage: string | null;
            quantity: number | null;
            instructions: string | null;
            prescriptionId: string;
        }[];
        author: {
            user: {
                id: string;
                email: string;
                password: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            specialty: string | null;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        notes: string | null;
        code: string;
        status: import(".prisma/client").$Enums.PrescriptionStatus;
        authorId: string;
        patientId: string;
        consumedAt: Date | null;
    }>;
    findByDoctor(user: JwtPayload, filters: FilterPrescriptionDto): Promise<{
        data: ({
            patient: {
                user: {
                    id: string;
                    email: string;
                    name: string;
                };
            } & {
                id: string;
                birthDate: Date | null;
                userId: string;
            };
            items: {
                id: string;
                name: string;
                dosage: string | null;
                quantity: number | null;
                instructions: string | null;
                prescriptionId: string;
            }[];
            author: {
                user: {
                    id: string;
                    email: string;
                    name: string;
                };
            } & {
                id: string;
                specialty: string | null;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            notes: string | null;
            code: string;
            status: import(".prisma/client").$Enums.PrescriptionStatus;
            authorId: string;
            patientId: string;
            consumedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByPatient(user: JwtPayload, filters: FilterPrescriptionDto): Promise<{
        data: ({
            patient: {
                user: {
                    id: string;
                    email: string;
                    name: string;
                };
            } & {
                id: string;
                birthDate: Date | null;
                userId: string;
            };
            items: {
                id: string;
                name: string;
                dosage: string | null;
                quantity: number | null;
                instructions: string | null;
                prescriptionId: string;
            }[];
            author: {
                user: {
                    id: string;
                    email: string;
                    name: string;
                };
            } & {
                id: string;
                specialty: string | null;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            notes: string | null;
            code: string;
            status: import(".prisma/client").$Enums.PrescriptionStatus;
            authorId: string;
            patientId: string;
            consumedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAll(filters: FilterPrescriptionDto): Promise<{
        data: ({
            patient: {
                user: {
                    id: string;
                    email: string;
                    name: string;
                };
            } & {
                id: string;
                birthDate: Date | null;
                userId: string;
            };
            items: {
                id: string;
                name: string;
                dosage: string | null;
                quantity: number | null;
                instructions: string | null;
                prescriptionId: string;
            }[];
            author: {
                user: {
                    id: string;
                    email: string;
                    name: string;
                };
            } & {
                id: string;
                specialty: string | null;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            notes: string | null;
            code: string;
            status: import(".prisma/client").$Enums.PrescriptionStatus;
            authorId: string;
            patientId: string;
            consumedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(user: JwtPayload, id: string): Promise<{
        patient: {
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            birthDate: Date | null;
            userId: string;
        };
        items: {
            id: string;
            name: string;
            dosage: string | null;
            quantity: number | null;
            instructions: string | null;
            prescriptionId: string;
        }[];
        author: {
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            specialty: string | null;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        notes: string | null;
        code: string;
        status: import(".prisma/client").$Enums.PrescriptionStatus;
        authorId: string;
        patientId: string;
        consumedAt: Date | null;
    }>;
    consume(user: JwtPayload, id: string): Promise<{
        items: {
            id: string;
            name: string;
            dosage: string | null;
            quantity: number | null;
            instructions: string | null;
            prescriptionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        notes: string | null;
        code: string;
        status: import(".prisma/client").$Enums.PrescriptionStatus;
        authorId: string;
        patientId: string;
        consumedAt: Date | null;
    }>;
    generatePdf(user: JwtPayload, id: string): Promise<Buffer>;
    getMetrics(from?: string, to?: string): Promise<{
        totals: {
            doctors: number;
            patients: number;
            prescriptions: number;
        };
        byStatus: Record<string, number>;
        byDay: {
            date: string;
            count: number;
        }[];
        topDoctors: {
            doctorId: string;
            count: number;
        }[];
    }>;
    findAllAdmin(filters: FilterPrescriptionDto): Promise<{
        data: ({
            patient: {
                user: {
                    id: string;
                    email: string;
                    name: string;
                };
            } & {
                id: string;
                birthDate: Date | null;
                userId: string;
            };
            items: {
                id: string;
                name: string;
                dosage: string | null;
                quantity: number | null;
                instructions: string | null;
                prescriptionId: string;
            }[];
            author: {
                user: {
                    id: string;
                    email: string;
                    name: string;
                };
            } & {
                id: string;
                specialty: string | null;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            notes: string | null;
            code: string;
            status: import(".prisma/client").$Enums.PrescriptionStatus;
            authorId: string;
            patientId: string;
            consumedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    private query;
    private assertAccess;
    private generateCode;
}
