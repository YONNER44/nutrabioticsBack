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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const prescriptions_service_1 = require("./prescriptions.service");
const create_prescription_dto_1 = require("./dto/create-prescription.dto");
const filter_prescription_dto_1 = require("./dto/filter-prescription.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let PrescriptionsController = class PrescriptionsController {
    prescriptionsService;
    constructor(prescriptionsService) {
        this.prescriptionsService = prescriptionsService;
    }
    create(user, dto) {
        return this.prescriptionsService.create(user, dto);
    }
    findMine(user, filters) {
        return this.prescriptionsService.findByDoctor(user, filters);
    }
    findOne(user, id) {
        return this.prescriptionsService.findOne(user, id);
    }
    findPatientPrescriptions(user, filters) {
        return this.prescriptionsService.findByPatient(user, filters);
    }
    consume(user, id) {
        return this.prescriptionsService.consume(user, id);
    }
    async downloadPdf(user, id, res) {
        const buffer = await this.prescriptionsService.generatePdf(user, id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="prescription-${id}.pdf"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    findAllAdmin(filters) {
        return this.prescriptionsService.findAllAdmin(filters);
    }
    getMetrics(from, to) {
        return this.prescriptionsService.getMetrics(from, to);
    }
};
exports.PrescriptionsController = PrescriptionsController;
__decorate([
    (0, common_1.Post)('prescriptions'),
    (0, roles_decorator_1.Roles)(client_1.Role.doctor),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_prescription_dto_1.CreatePrescriptionDto]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('prescriptions'),
    (0, roles_decorator_1.Roles)(client_1.Role.doctor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, filter_prescription_dto_1.FilterPrescriptionDto]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('prescriptions/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.doctor, client_1.Role.patient, client_1.Role.admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('me/prescriptions'),
    (0, roles_decorator_1.Roles)(client_1.Role.patient),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, filter_prescription_dto_1.FilterPrescriptionDto]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "findPatientPrescriptions", null);
__decorate([
    (0, common_1.Put)('prescriptions/:id/consume'),
    (0, roles_decorator_1.Roles)(client_1.Role.patient),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "consume", null);
__decorate([
    (0, common_1.Get)('prescriptions/:id/pdf'),
    (0, roles_decorator_1.Roles)(client_1.Role.patient, client_1.Role.doctor, client_1.Role.admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Get)('admin/prescriptions'),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_prescription_dto_1.FilterPrescriptionDto]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('admin/metrics'),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "getMetrics", null);
exports.PrescriptionsController = PrescriptionsController = __decorate([
    (0, swagger_1.ApiTags)('prescriptions'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [prescriptions_service_1.PrescriptionsService])
], PrescriptionsController);
//# sourceMappingURL=prescriptions.controller.js.map