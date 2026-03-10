import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { FilterPrescriptionDto } from './dto/filter-prescription.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/request-with-user.interface';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('prescriptions')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller()
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  // ─── Doctor ───────────────────────────────────────────────────────────────

  @Post('prescriptions')
  @Roles(Role.doctor)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(user, dto);
  }

  @Get('prescriptions')
  @Roles(Role.doctor)
  findMine(
    @CurrentUser() user: JwtPayload,
    @Query() filters: FilterPrescriptionDto,
  ) {
    return this.prescriptionsService.findByDoctor(user, filters);
  }

  @Get('prescriptions/:id')
  @Roles(Role.doctor, Role.patient, Role.admin)
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.prescriptionsService.findOne(user, id);
  }

  // ─── Patient ──────────────────────────────────────────────────────────────

  @Get('me/prescriptions')
  @Roles(Role.patient)
  findPatientPrescriptions(
    @CurrentUser() user: JwtPayload,
    @Query() filters: FilterPrescriptionDto,
  ) {
    return this.prescriptionsService.findByPatient(user, filters);
  }

  @Put('prescriptions/:id/consume')
  @Roles(Role.patient)
  consume(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.prescriptionsService.consume(user, id);
  }

  @Get('prescriptions/:id/pdf')
  @Roles(Role.patient, Role.doctor, Role.admin)
  async downloadPdf(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.prescriptionsService.generatePdf(user, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="prescription-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Get('admin/prescriptions')
  @Roles(Role.admin)
  findAllAdmin(@Query() filters: FilterPrescriptionDto) {
    return this.prescriptionsService.findAllAdmin(filters);
  }

  @Get('admin/metrics')
  @Roles(Role.admin)
  getMetrics(@Query('from') from?: string, @Query('to') to?: string) {
    return this.prescriptionsService.getMetrics(from, to);
  }
}
