import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { IsString, IsNumber, IsEnum, Min, Max, IsOptional } from 'class-validator';

export enum BranchEnum {
  AUTO = 'auto',
  VIDA = 'vida',
  SAUDE = 'saude',
  RESIDENCIAL = 'residencial',
  EMPRESARIAL = 'empresarial',
  RC_PROFISSIONAL = 'rc_profissional',
}

export class CalculateQuotesDto {
  @IsEnum(BranchEnum)
  branch: BranchEnum;

  @IsString()
  clientName: string;

  @IsString()
  document: string;

  @IsString()
  postalCode: string;

  @IsString()
  itemDetails: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  bonusClass: number;

  @IsNumber()
  @Min(5)
  @Max(35)
  brokerCommissionRate: number;

  @IsOptional()
  @IsString()
  leadId?: string;
}

@ApiTags('Multicálculo & Precificação')
@Controller('api/v1/pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dispara cotação paralela nas companhias seguradoras homologadas' })
  @ApiResponse({ status: 200, description: 'Lista de cotações das seguradoras com recálculo de comissão e IOF' })
  async calculate(@Body() dto: CalculateQuotesDto) {
    return this.pricingService.calculateMultiQuotes(dto);
  }
}
