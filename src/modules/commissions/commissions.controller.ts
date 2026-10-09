import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';

@ApiTags('Comissões & Conciliação Financeira')
@Controller('api/v1/commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get('ledger')
  @ApiOperation({ summary: 'Lista lançamentos de comissão e repasses a produtores' })
  async getLedger(@Query('status') status?: string) {
    return this.commissionsService.getLedger(status);
  }

  @Post('reconcile')
  @ApiOperation({ summary: 'Dispara conciliação automática cruzando extrato da seguradora com apólices' })
  async reconcile(@Body() body: { insurerName: string; statementRecords?: any[] }) {
    return this.commissionsService.reconcileStatement(body.insurerName, body.statementRecords || []);
  }
}
