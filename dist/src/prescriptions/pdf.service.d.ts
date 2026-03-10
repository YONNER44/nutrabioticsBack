import { PrescriptionStatus } from '@prisma/client';
interface PrescriptionForPdf {
    id: string;
    code: string;
    status: PrescriptionStatus;
    notes: string | null;
    createdAt: Date;
    consumedAt: Date | null;
    items: {
        name: string;
        dosage: string | null;
        quantity: number | null;
        instructions: string | null;
    }[];
    patient: {
        user: {
            name: string;
            email: string;
        };
    };
    author: {
        user: {
            name: string;
            email: string;
        };
        specialty?: string | null;
    };
}
export declare class PdfService {
    generate(prescription: PrescriptionForPdf): Promise<Buffer>;
}
export {};
