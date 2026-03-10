import { Injectable } from '@nestjs/common';
import { PrescriptionStatus } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');

interface PrescriptionForPdf {
  id: string;
  code: string;
  status: PrescriptionStatus;
  notes: string | null;
  createdAt: Date;
  consumedAt: Date | null;
  items: {
    name: string;
    dosage: string | null;
    quantity: number | null;
    instructions: string | null;
  }[];
  patient: { user: { name: string; email: string } };
  author: { user: { name: string; email: string }; specialty?: string | null };
}

@Injectable()
export class PdfService {
  generate(prescription: PrescriptionForPdf): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 }) as InstanceType<
        typeof PDFDocument
      > &
        NodeJS.EventEmitter;
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ─── Header ────────────────────────────────────────────────────────
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

      // ─── Prescription info ─────────────────────────────────────────────
      doc.fontSize(14).font('Helvetica-Bold').text('Prescripción Médica');
      doc.moveDown(0.3);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Código: ${prescription.code}`, { continued: true });
      doc.text(
        `   Estado: ${prescription.status === PrescriptionStatus.consumed ? 'Consumida' : 'Pendiente'}`,
        { align: 'right' },
      );

      doc.text(
        `Fecha de emisión: ${prescription.createdAt.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      );
      if (prescription.consumedAt) {
        doc.text(
          `Fecha de consumo: ${prescription.consumedAt.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        );
      }
      doc.moveDown(0.5);

      // ─── Doctor ────────────────────────────────────────────────────────
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

      // ─── Patient ───────────────────────────────────────────────────────
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(12).font('Helvetica-Bold').text('Paciente');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Nombre: ${prescription.patient.user.name}`);
      doc.text(`Email: ${prescription.patient.user.email}`);
      doc.moveDown(0.5);

      // ─── Items ─────────────────────────────────────────────────────────
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

      // ─── Notes ─────────────────────────────────────────────────────────
      if (prescription.notes) {
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').text('Notas');
        doc.fontSize(10).font('Helvetica').text(prescription.notes);
        doc.moveDown(0.5);
      }

      // ─── Footer ────────────────────────────────────────────────────────
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('gray')
        .text(
          'Este documento es una prescripción médica digital generada por NutraBiotics. ' +
            `ID de verificación: ${prescription.id}`,
          { align: 'center' },
        );

      doc.end();
    });
  }
}
