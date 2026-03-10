"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const PDFDocument = require('pdfkit');
let PdfService = class PdfService {
    generate(prescription) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc
                .fontSize(22)
                .font('Helvetica-Bold')
                .text('NutraBiotics', { align: 'center' });
            doc
                .fontSize(12)
                .font('Helvetica')
                .text('Sistema de Prescripciones', { align: 'center' });
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);
            doc.fontSize(14).font('Helvetica-Bold').text('Prescripción Médica');
            doc.moveDown(0.3);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Código: ${prescription.code}`, { continued: true });
            doc.text(`   Estado: ${prescription.status === client_1.PrescriptionStatus.consumed ? 'Consumida' : 'Pendiente'}`, { align: 'right' });
            doc.text(`Fecha de emisión: ${prescription.createdAt.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`);
            if (prescription.consumedAt) {
                doc.text(`Fecha de consumo: ${prescription.consumedAt.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`);
            }
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.3);
            doc.fontSize(12).font('Helvetica-Bold').text('Médico Tratante');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Nombre: ${prescription.author.user.name}`);
            doc.text(`Email: ${prescription.author.user.email}`);
            if (prescription.author.specialty) {
                doc.text(`Especialidad: ${prescription.author.specialty}`);
            }
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.3);
            doc.fontSize(12).font('Helvetica-Bold').text('Paciente');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Nombre: ${prescription.patient.user.name}`);
            doc.text(`Email: ${prescription.patient.user.email}`);
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.3);
            doc.fontSize(12).font('Helvetica-Bold').text('Ítems Prescritos');
            doc.moveDown(0.3);
            prescription.items.forEach((item, i) => {
                doc
                    .fontSize(10)
                    .font('Helvetica-Bold')
                    .text(`${i + 1}. ${item.name}`);
                if (item.dosage) {
                    doc
                        .fontSize(9)
                        .font('Helvetica')
                        .text(`   Dosis: ${item.dosage}`, { indent: 10 });
                }
                if (item.quantity !== null) {
                    doc
                        .fontSize(9)
                        .font('Helvetica')
                        .text(`   Cantidad: ${item.quantity} unidades`, { indent: 10 });
                }
                if (item.instructions) {
                    doc
                        .fontSize(9)
                        .font('Helvetica')
                        .text(`   Indicaciones: ${item.instructions}`, { indent: 10 });
                }
                doc.moveDown(0.3);
            });
            if (prescription.notes) {
                doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                doc.moveDown(0.3);
                doc.fontSize(11).font('Helvetica-Bold').text('Notas');
                doc.fontSize(10).font('Helvetica').text(prescription.notes);
                doc.moveDown(0.5);
            }
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.3);
            doc
                .fontSize(8)
                .font('Helvetica')
                .fillColor('gray')
                .text('Este documento es una prescripción médica digital generada por NutraBiotics. ' +
                `ID de verificación: ${prescription.id}`, { align: 'center' });
            doc.end();
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map