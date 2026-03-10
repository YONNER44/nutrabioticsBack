import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        role: dto.role,
        ...(dto.role === Role.doctor
          ? { doctor: { create: { specialty: dto.specialty ?? null } } }
          : {}),
        ...(dto.role === Role.patient
          ? {
              patient: {
                create: {
                  birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
                },
              },
            }
          : {}),
      },
      include: { doctor: true, patient: true },
    });

    const { password: _password, ...safe } = user;
    return safe;
  }

  async findAll(role?: Role, query?: string, page = 1, limit = 10) {
    const where = {
      deletedAt: null,
      ...(role ? { role } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { email: { contains: query, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          doctor: { select: { id: true, specialty: true } },
          patient: { select: { id: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findDoctors(page = 1, limit = 10) {
    const where = { role: Role.doctor, deletedAt: null };
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          doctor: { select: { id: true, specialty: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findPatients(page = 1, limit = 10) {
    const where = { role: Role.patient, deletedAt: null };
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          patient: { select: { id: true, birthDate: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { doctor: true, patient: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password: _password, ...safe } = user;
    return safe;
  }
}
