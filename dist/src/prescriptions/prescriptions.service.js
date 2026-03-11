"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const pdf_service_1 = require("./pdf.service");
let PrescriptionsService = class PrescriptionsService {
    prisma;
    pdfService;
    constructor(prisma, pdfService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
    }
    async create(user, dto) {
        const doctor = await this.prisma.doctor.findFirst({
            where: { user: { id: user.sub } },
        });
        if (!doctor)
            throw new common_1.ForbiddenException('Doctor profile not found');
        const patient = await this.prisma.patient.findUnique({
            where: { id: dto.patientId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        const code = this.generateCode();
        const prescription = await this.prisma.prescription.create({
            data: {
                code,
                notes: dto.notes,
                patientId: dto.patientId,
                authorId: doctor.id,
                items: { create: dto.items },
            },
            include: {
                items: true,
                patient: { include: { user: true } },
                author: { include: { user: true } },
            },
        });
        return prescription;
    }
    async findByDoctor(user, filters) {
        const doctor = await this.prisma.doctor.findFirst({
            where: { user: { id: user.sub } },
        });
        if (!doctor)
            throw new common_1.ForbiddenException('Doctor profile not found');
        return this.query({ authorId: doctor.id }, filters);
    }
    async findByPatient(user, filters) {
        const patient = await this.prisma.patient.findFirst({
            where: { user: { id: user.sub } },
        });
        if (!patient)
            throw new common_1.ForbiddenException('Patient profile not found');
        return this.query({ patientId: patient.id }, filters);
    }
    async findAll(filters) {
        const where = { deletedAt: null };
        if (filters.doctorId)
            where.authorId = filters.doctorId;
        if (filters.patientId)
            where.patientId = filters.patientId;
        return this.query(where, filters);
    }
    async findOne(user, id) {
        const prescription = await this.prisma.prescription.findFirst({
            where: { id, deletedAt: null },
            include: {
                items: true,
                patient: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                author: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
            },
        });
        if (!prescription)
            throw new common_1.NotFoundException('Prescription not found');
        this.assertAccess(user, prescription);
        return prescription;
    }
    async consume(user, id) {
        const prescription = await this.prisma.prescription.findFirst({
            where: { id, deletedAt: null },
            include: { patient: { include: { user: true } } },
        });
        if (!prescription)
            throw new common_1.NotFoundException('Prescription not found');
        if (prescription.patient.user.id !== user.sub) {
            throw new common_1.ForbiddenException('Not your prescription');
        }
        if (prescription.status === client_1.PrescriptionStatus.consumed) {
            throw new common_1.BadRequestException('Prescription already consumed');
        }
        return this.prisma.prescription.update({
            where: { id },
            data: { status: client_1.PrescriptionStatus.consumed, consumedAt: new Date() },
            include: { items: true },
        });
    }
    async generatePdf(user, id) {
        const prescription = await this.prisma.prescription.findFirst({
            where: { id, deletedAt: null },
            include: {
                items: true,
                patient: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                author: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
            },
        });
        if (!prescription)
            throw new common_1.NotFoundException('Prescription not found');
        this.assertAccess(user, prescription);
        return this.pdfService.generate(prescription);
    }
    async getMetrics(from, to) {
        const dateFilter = from || to
            ? {
                createdAt: {
                    ...(from ? { gte: new Date(from) } : {}),
                    ...(to ? { lte: new Date(to) } : {}),
                },
            }
            : {};
        const [doctors, patients, totalPrescriptions, byStatus, byDay, topDoctors] = await Promise.all([
            this.prisma.user.count({ where: { role: 'doctor', deletedAt: null } }),
            this.prisma.user.count({ where: { role: 'patient', deletedAt: null } }),
            this.prisma.prescription.count({
                where: { deletedAt: null, ...dateFilter },
            }),
            this.prisma.prescription.groupBy({
                by: ['status'],
                _count: true,
                where: { deletedAt: null, ...dateFilter },
            }),
            this.prisma.$queryRaw(client_1.Prisma.sql `
            SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, COUNT(*) as count
            FROM "Prescription"
            WHERE "deletedAt" IS NULL
              ${from ? client_1.Prisma.sql `AND "createdAt" >= ${new Date(from)}` : client_1.Prisma.empty}
              ${to ? client_1.Prisma.sql `AND "createdAt" <= ${new Date(to)}` : client_1.Prisma.empty}
            GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
            ORDER BY date DESC
            LIMIT 30
          `),
            this.prisma.prescription.groupBy({
                by: ['authorId'],
                _count: { id: true },
                where: { deletedAt: null, ...dateFilter },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),
        ]);
        const byStatusMap = {};
        for (const s of byStatus) {
            byStatusMap[s.status] = s._count;
        }
        return {
            totals: { doctors, patients, prescriptions: totalPrescriptions },
            byStatus: byStatusMap,
            byDay: byDay.map((d) => ({ date: d.date, count: Number(d.count) })),
            topDoctors: topDoctors.map((t) => ({
                doctorId: t.authorId,
                count: t._count.id,
            })),
        };
    }
    async findAllAdmin(filters) {
        const where = { deletedAt: null };
        if (filters.status)
            where.status = filters.status;
        if (filters.doctorId)
            where.authorId = filters.doctorId;
        if (filters.patientId)
            where.patientId = filters.patientId;
        if (filters.from || filters.to) {
            where.createdAt = {
                ...(filters.from ? { gte: new Date(filters.from) } : {}),
                ...(filters.to ? { lte: new Date(filters.to) } : {}),
            };
        }
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;
        const order = filters.order ?? 'desc';
        const [data, total] = await Promise.all([
            this.prisma.prescription.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: order },
                include: {
                    items: true,
                    patient: {
                        include: {
                            user: { select: { id: true, name: true, email: true } },
                        },
                    },
                    author: {
                        include: {
                            user: { select: { id: true, name: true, email: true } },
                        },
                    },
                },
            }),
            this.prisma.prescription.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async query(baseWhere, filters) {
        const where = { ...baseWhere, deletedAt: null };
        if (filters.status)
            where.status = filters.status;
        if (filters.from || filters.to) {
            where.createdAt = {
                ...(filters.from ? { gte: new Date(filters.from) } : {}),
                ...(filters.to ? { lte: new Date(filters.to) } : {}),
            };
        }
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;
        const order = filters.order ?? 'desc';
        const [data, total] = await Promise.all([
            this.prisma.prescription.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: order },
                include: {
                    items: true,
                    patient: {
                        include: {
                            user: { select: { id: true, name: true, email: true } },
                        },
                    },
                    author: {
                        include: {
                            user: { select: { id: true, name: true, email: true } },
                        },
                    },
                },
            }),
            this.prisma.prescription.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    assertAccess(user, prescription) {
        if (user.role === client_1.Role.admin)
            return;
        if (user.role === client_1.Role.doctor && prescription.author.user.id === user.sub)
            return;
        if (user.role === client_1.Role.patient && prescription.patient.user.id === user.sub)
            return;
        throw new common_1.ForbiddenException('Access denied');
    }
    generateCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const random = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        return `RX-${random}`;
    }
};
exports.PrescriptionsService = PrescriptionsService;
exports.PrescriptionsService = PrescriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService])
], PrescriptionsService);
//# sourceMappingURL=prescriptions.service.js.map