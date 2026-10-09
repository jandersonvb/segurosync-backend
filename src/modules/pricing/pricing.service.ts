import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculateQuotesDto } from './pricing.controller';

export interface InsurerQuoteResult {
  id: string;
  insurerName: string;
  netPremium: number;
  commissionRate: number;
  commissionAmount: number;
  iofAmount: number;
  totalPremium: number;
  installments: { count: number; value: number };
  deductibleNormal: number;
  deductibleReduced: number;
  coverages: {
    casco: string;
    rcfVMaterial: number;
    rcfVCorporal: number;
    carroReserva: string;
    guincho: string;
  };
  scoreRating: number;
  status: 'aprovado' | 'em_analise';
}

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calculateMultiQuotes(dto: CalculateQuotesDto): Promise<InsurerQuoteResult[]> {
    this.logger.log(`Iniciando multicálculo para ${dto.clientName} (Ramo: ${dto.branch}, Comissão: ${dto.brokerCommissionRate}%)`);

    const bonusDiscount = 1 - (dto.bonusClass * 0.04);
    const baseValue = dto.branch === 'auto' ? 4200 
      : dto.branch === 'empresarial' ? 12000
      : dto.branch === 'vida' ? 3600
      : dto.branch === 'residencial' ? 2400
      : 4800;

    const insurers = [
      { name: 'Porto Seguro', factor: 1.05, score: 98, guincho: 'Km Ilimitado em todo o Território Nacional', casco: '100% Tabela FIPE + Reposição 0km' },
      { name: 'Tokio Marine', factor: 0.94, score: 94, guincho: 'Até 800 km ou retorno ao domicílio', casco: '100% FIPE Compreensiva' },
      { name: 'Bradesco Seguros', factor: 1.02, score: 93, guincho: '1.000 km com assistência Mercosul', casco: '100% FIPE Integral' },
      { name: 'Allianz Seguros', factor: 0.98, score: 91, guincho: 'Km Ilimitado para pane e colisão', casco: '100% FIPE com proteção mecânica' },
      { name: 'SulAmérica', factor: 0.96, score: 89, guincho: '600 km com guincho e chaveiro', casco: '100% FIPE + Rede Referenciada' },
      { name: 'HDI Seguros', factor: 0.89, score: 87, guincho: '500 km', casco: '100% FIPE Bate-Pronto' },
    ];

    return insurers.map((ins, index) => {
      const rawNet = Math.round(baseValue * ins.factor * bonusDiscount);
      const commissionAmount = Math.round(rawNet * (dto.brokerCommissionRate / 100));
      const subtotal = rawNet + commissionAmount;
      const iofAmount = Math.round(subtotal * 0.0738);
      const totalPremium = subtotal + iofAmount;

      const deductibleNormal = Math.round(4400 * ins.factor);
      const deductibleReduced = Math.round(deductibleNormal * 0.55);

      return {
        id: `quote-${index + 1}`,
        insurerName: ins.name,
        netPremium: rawNet,
        commissionRate: dto.brokerCommissionRate,
        commissionAmount,
        iofAmount,
        totalPremium,
        installments: {
          count: 10,
          value: Math.round((totalPremium / 10) * 100) / 100,
        },
        deductibleNormal,
        deductibleReduced,
        coverages: {
          casco: ins.cascoDesc || ins.casco,
          rcfVMaterial: 150000,
          rcfVCorporal: 150000,
          carroReserva: '15 dias categoria Sedan com ar',
          guincho: ins.guincho,
        },
        scoreRating: ins.score,
        status: 'aprovado',
      };
    });
  }
}
