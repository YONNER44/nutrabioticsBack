import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: {
    user: { findUnique: jest.Mock };
    refreshToken: { create: jest.Mock };
  };

  beforeEach(async () => {
    prismaService = {
      user: { findUnique: jest.fn() },
      refreshToken: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('mock-secret') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@x.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      prismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: hashed,
        name: 'Test',
        role: 'patient',
        deletedAt: null,
        doctor: null,
        patient: null,
      });
      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens for valid credentials', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        password: hashed,
        name: 'Test User',
        role: 'patient',
        createdAt: new Date(),
        deletedAt: null,
        doctor: null,
        patient: { id: 'p1' },
      };
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
