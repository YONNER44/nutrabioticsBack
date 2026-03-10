import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.admin, Role.doctor)
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findPatients(pagination.page, pagination.limit);
  }
}
