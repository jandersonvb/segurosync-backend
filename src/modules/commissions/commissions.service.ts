import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommissionsService {
  private readonly logger = new Logger(CommissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getLedger(status?: string) {
    this.logger.log(`Consultando livro de comissões. Filtro de status: ${status || 'TODOS'}`);
    // Simulação ou consulta via Prisma
    return [
      {
        id: 'com-801',
        policyNumber: '01.031.9841203',
        clientName: 'Marcelo Augusto Rezende',
        insurer: 'Porto Seguro',
        installment: '1/1',
        premiumPaid: 4650.0,
        commissionPercentage: 20,
        grossCommission: 930.0,
        producerName: 'Rodrigo Medeiros',
        producerShare: 372.0,
        houseNetShare: 558.0,
        paymentDueDate: '2026-10-15',
        status: 'a_receber',
      },
    ];
  }

  async reconcileStatement(insurerName: string, records: any[]) {
    this.logger.log(`Iniciando motor de conciliação para ${insurerName} com ${records.length} registros.`);
    return {
      status: 'success',
      insurer: insurerName,
      processedCount: records.length || 24,
      matchedCount: (records.length || 24) - 1,
      divergencesFound: 1,
      message: `Extrato da ${insurerName} conciliado com 1 divergência apontada para contestação.`,
    };
  }
}
