import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IssuePolicyDto } from './policies.controller';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPolicies() {
    return [
      {
        id: 'pol-2024-001',
        policyNumber: '01.031.9841203',
        ciCode: 'CI-BRD-884210',
        clientName: 'Marcelo Augusto Rezende',
        document: '192.833.401-20',
        branch: 'auto',
        itemDescription: 'Toyota Corolla Cross XRE 2.0 2024',
        insurer: 'Porto Seguro',
        startDate: '2026-04-12',
        endDate: '2027-04-12',
        netPremium: 4650,
        totalPremium: 5120.5,
        brokerCommissionRate: 20,
        brokerCommissionValue: 930.0,
        status: 'vigente',
      },
    ];
  }

  async issuePolicy(dto: IssuePolicyDto) {
    const policyNumber = `${Math.floor(10 + Math.random() * 89)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(1000000 + Math.random() * 8999999)}`;
    const ciCode = `CI-${dto.insurer.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    this.logger.log(`Apólice ${policyNumber} emitida com sucesso na ${dto.insurer}. Protocolo CI: ${ciCode}`);

    return {
      success: true,
      policyNumber,
      ciCode,
      insurer: dto.insurer,
      clientName: dto.clientName,
      issuedAt: new Date().toISOString(),
    };
  }
}
