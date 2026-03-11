import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { FilterPrescriptionDto } from './dto/filter-prescription.dto';
import { JwtPayload } from '../common/interfaces/request-with-user.interface';
import { Prisma, PrescriptionStatus, Role } from '@prisma/client';
import { PdfService } from './pdf.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  // ─── Doctor: create ───────────────────────────────────────────────────────

  async create(user: JwtPayload, dto: CreatePrescriptionDto) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { user: { id: user.sub } },
    });
    if (!doctor) throw new ForbiddenException('Doctor profile not found');

    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

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

  // ─── Doctor: list own ─────────────────────────────────────────────────────

  async findByDoctor(user: JwtPayload, filters: FilterPrescriptionDto) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { user: { id: user.sub } },
    });
    if (!doctor) throw new ForbiddenException('Doctor profile not found');

    return this.query({ authorId: doctor.id }, filters);
  }

  // ─── Patient: list own ────────────────────────────────────────────────────

  async findByPatient(user: JwtPayload, filters: FilterPrescriptionDto) {
    const patient = await this.prisma.patient.findFirst({
      where: { user: { id: user.sub } },
    });
    if (!patient) throw new ForbiddenException('Patient profile not found');

    return this.query({ patientId: patient.id }, filters);
  }

  // ─── Admin: list all ─────────────────────────────────────────────────────

  async findAll(filters: FilterPrescriptionDto) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filters.doctorId) where.authorId = filters.doctorId;
    if (filters.patientId) where.patientId = filters.patientId;
    return this.query(where, filters);
  }

  // ─── Find one ─────────────────────────────────────────────────────────────

  async findOne(user: JwtPayload, id: string) {
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

    if (!prescription) throw new NotFoundException('Prescription not found');
    this.assertAccess(user, prescription);
    return prescription;
  }

  // ─── Patient: consume ────────────────────────────────────────────────────

  async consume(user: JwtPayload, id: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id, deletedAt: null },
      include: { patient: { include: { user: true } } },
    });

    if (!prescription) throw new NotFoundException('Prescription not found');

    if (prescription.patient.user.id !== user.sub) {
      throw new ForbiddenException('Not your prescription');
    }

    if (prescription.status === PrescriptionStatus.consumed) {
      throw new BadRequestException('Prescription already consumed');
    }

    return this.prisma.prescription.update({
      where: { id },
      data: { status: PrescriptionStatus.consumed, consumedAt: new Date() },
      include: { items: true },
    });
  }

  // ─── PDF ──────────────────────────────────────────────────────────────────

  async generatePdf(user: JwtPayload, id: string): Promise<Buffer> {
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

    if (!prescription) throw new NotFoundException('Prescription not found');
    this.assertAccess(user, prescription);

    return this.pdfService.generate(prescription);
  }

  // ─── Admin: metrics ──────────────────────────────────────────────────────

  async getMetrics(from?: string, to?: string) {
    const dateFilter =
      from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {};

    const [doctors, patients, totalPrescriptions, byStatus, byDay, topDoctors] =
      await Promise.all([
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
        this.prisma.$queryRaw<{ date: string; count: bigint }[]>(
          Prisma.sql`
            SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, COUNT(*) as count
            FROM "Prescription"
            WHERE "deletedAt" IS NULL
              ${from ? Prisma.sql`AND "createdAt" >= ${new Date(from)}` : Prisma.empty}
              ${to ? Prisma.sql`AND "createdAt" <= ${new Date(to)}` : Prisma.empty}
            GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
            ORDER BY date DESC
            LIMIT 30
          `,
        ),
        this.prisma.prescription.groupBy({
          by: ['authorId'],
          _count: { id: true },
          where: { deletedAt: null, ...dateFilter },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
      ]);

    const byStatusMap: Record<string, number> = {};
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

  // ─── Admin: all prescriptions ─────────────────────────────────────────────

  async findAllAdmin(filters: FilterPrescriptionDto) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.doctorId) where.authorId = filters.doctorId;
    if (filters.patientId) where.patientId = filters.patientId;
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

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async query(
    baseWhere: Record<string, unknown>,
    filters: FilterPrescriptionDto,
  ) {
    const where: Record<string, unknown> = { ...baseWhere, deletedAt: null };

    if (filters.status) where.status = filters.status;
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

  private assertAccess(
    user: JwtPayload,
    prescription: {
      patient: { user: { id: string } };
      author: { user: { id: string } };
    },
  ) {
    if (user.role === Role.admin) return;
    if (user.role === Role.doctor && prescription.author.user.id === user.sub)
      return;
    if (user.role === Role.patient && prescription.patient.user.id === user.sub)
      return;
    throw new ForbiddenException('Access denied');
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const random = Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
    return `RX-${random}`;
  }
}
