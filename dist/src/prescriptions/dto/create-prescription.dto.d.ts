export declare class CreatePrescriptionItemDto {
    name: string;
    dosage?: string;
    quantity?: number;
    instructions?: string;
}
export declare class CreatePrescriptionDto {
    patientId: string;
    notes?: string;
    items: CreatePrescriptionItemDto[];
}
