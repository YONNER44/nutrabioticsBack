"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    await prisma.prescriptionItem.deleteMany();
    await prisma.prescription.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.user.deleteMany();
    await prisma.user.create({
        data: {
            email: 'admin@test.com',
            password: await bcrypt.hash('admin123', 10),
            name: 'Admin NutraBiotics',
            role: client_1.Role.admin,
        },
    });
    console.log('✅ Admin created: admin@test.com / admin123');
    const doctorUser = await prisma.user.create({
        data: {
            email: 'dr@test.com',
            password: await bcrypt.hash('dr123', 10),
            name: 'Dr. Carlos Medina',
            role: client_1.Role.doctor,
            doctor: {
                create: { specialty: 'Medicina Interna' },
            },
        },
        include: { doctor: true },
    });
    console.log('✅ Doctor created: dr@test.com / dr123');
    const doctor2User = await prisma.user.create({
        data: {
            email: 'dra@test.com',
            password: await bcrypt.hash('dra123', 10),
            name: 'Dra. Laura Vega',
            role: client_1.Role.doctor,
            doctor: {
                create: { specialty: 'Nutrición Clínica' },
            },
        },
        include: { doctor: true },
    });
    const patientUser = await prisma.user.create({
        data: {
            email: 'patient@test.com',
            password: await bcrypt.hash('patient123', 10),
            name: 'Juan Pérez',
            role: client_1.Role.patient,
            patient: {
                create: { birthDate: new Date('1990-05-15') },
            },
        },
        include: { patient: true },
    });
    console.log('✅ Patient created: patient@test.com / patient123');
    const patient2User = await prisma.user.create({
        data: {
            email: 'patient2@test.com',
            password: await bcrypt.hash('patient123', 10),
            name: 'María Gómez',
            role: client_1.Role.patient,
            patient: {
                create: { birthDate: new Date('1985-11-20') },
            },
        },
        include: { patient: true },
    });
    const doctor = doctorUser.doctor;
    const doctor2 = doctor2User.doctor;
    const patient = patientUser.patient;
    const patient2 = patient2User.patient;
    const prescriptionsData = [
        {
            code: 'RX-AA001',
            status: client_1.PrescriptionStatus.pending,
            notes: 'Tomar después de las comidas. Control en 2 semanas.',
            authorId: doctor.id,
            patientId: patient.id,
            items: [
                {
                    name: 'Amoxicilina 500mg',
                    dosage: '1 cada 8h',
                    quantity: 21,
                    instructions: 'Después de comer',
                },
                {
                    name: 'Ibuprofeno 400mg',
                    dosage: '1 cada 12h',
                    quantity: 14,
                    instructions: 'Solo si hay dolor',
                },
            ],
        },
        {
            code: 'RX-BB002',
            status: client_1.PrescriptionStatus.consumed,
            notes: 'Prescripción completa. Paciente reporta mejoría.',
            authorId: doctor.id,
            patientId: patient.id,
            consumedAt: new Date(),
            items: [
                {
                    name: 'Omeprazol 20mg',
                    dosage: '1 en ayunas',
                    quantity: 14,
                    instructions: 'En ayunas, 30 min antes de desayuno',
                },
            ],
        },
        {
            code: 'RX-CC003',
            status: client_1.PrescriptionStatus.pending,
            notes: 'Suplemento vitamínico indicado.',
            authorId: doctor2.id,
            patientId: patient.id,
            items: [
                {
                    name: 'Vitamina D3 2000UI',
                    dosage: '1 diaria',
                    quantity: 30,
                    instructions: 'Con el desayuno',
                },
                {
                    name: 'Magnesio 400mg',
                    dosage: '1 en la noche',
                    quantity: 30,
                    instructions: 'Antes de dormir',
                },
                {
                    name: 'Zinc 10mg',
                    dosage: '1 diaria',
                    quantity: 30,
                    instructions: 'Con comida',
                },
            ],
        },
        {
            code: 'RX-DD004',
            status: client_1.PrescriptionStatus.consumed,
            notes: null,
            authorId: doctor.id,
            patientId: patient2.id,
            consumedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            items: [
                {
                    name: 'Metformina 500mg',
                    dosage: '1 con cada comida',
                    quantity: 90,
                    instructions: 'Con alimentos',
                },
                {
                    name: 'Atorvastatina 10mg',
                    dosage: '1 en la noche',
                    quantity: 30,
                    instructions: 'Noche',
                },
            ],
        },
        {
            code: 'RX-EE005',
            status: client_1.PrescriptionStatus.pending,
            notes: 'Paciente con déficit nutricional.',
            authorId: doctor2.id,
            patientId: patient2.id,
            items: [
                {
                    name: 'Hierro Bisglicinato 25mg',
                    dosage: '1 diaria',
                    quantity: 30,
                    instructions: 'En ayunas',
                },
                {
                    name: 'Vitamina C 500mg',
                    dosage: '1 diaria',
                    quantity: 30,
                    instructions: 'Con el hierro para mejor absorción',
                },
            ],
        },
        {
            code: 'RX-FF006',
            status: client_1.PrescriptionStatus.consumed,
            authorId: doctor.id,
            patientId: patient.id,
            consumedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            items: [
                {
                    name: 'Azitromicina 500mg',
                    dosage: '1 diaria por 3 días',
                    quantity: 3,
                    instructions: 'Una hora antes de comer',
                },
            ],
        },
        {
            code: 'RX-GG007',
            status: client_1.PrescriptionStatus.pending,
            notes: 'Control de colesterol.',
            authorId: doctor2.id,
            patientId: patient.id,
            items: [
                {
                    name: 'Omega 3 1000mg',
                    dosage: '2 diarias',
                    quantity: 60,
                    instructions: 'Con comidas',
                },
            ],
        },
    ];
    for (const p of prescriptionsData) {
        const { items, ...prescriptionData } = p;
        await prisma.prescription.create({
            data: {
                ...prescriptionData,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
                items: { create: items },
            },
        });
    }
    console.log(`✅ ${prescriptionsData.length} prescriptions created`);
    console.log('\n📋 Test credentials:');
    console.log('  Admin:   admin@test.com / admin123');
    console.log('  Doctor:  dr@test.com / dr123');
    console.log('  Patient: patient@test.com / patient123');
    console.log('\n🎉 Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map