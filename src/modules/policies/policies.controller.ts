import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';

export class IssuePolicyDto {
  clientName: string;
  document: string;
  branch: string;
  itemDescription: string;
  insurer: string;
  netPremium: number;
  totalPremium: number;
  brokerCommissionRate: number;
  producerSplitRate?: number;
  paymentMethod?: string;
}

@ApiTags('Apólices & Emissão')
@Controller('api/v1/policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as apólices vigentes e pendentes de renovação' })
  async getPolicies() {
    return this.policiesService.getPolicies();
  }

  @Post('issue')
  @ApiOperation({ summary: 'Emite apólice diretamente e gera protocolo CI da SUSEP' })
  async issuePolicy(@Body() dto: IssuePolicyDto) {
    return this.policiesService.issuePolicy(dto);
  }
}
