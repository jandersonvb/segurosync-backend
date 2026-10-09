import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';

export class ChangePlanDto {
  targetPlan: 'starter' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  paymentMethodId?: string;
}

@ApiTags('Planos & Assinatura da Corretora (SaaS Billing)')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Obter status da assinatura ativa da corretora e limites de uso' })
  async getCurrentSubscription() {
    return this.subscriptionsService.getCurrentPlan();
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Listar histórico de faturas e notas fiscais (NFe)' })
  async getInvoices() {
    return this.subscriptionsService.getInvoices();
  }

  @Post('change-plan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upgrade ou downgrade de plano da corretora' })
  async changePlan(@Body() dto: ChangePlanDto) {
    return this.subscriptionsService.changePlan(dto);
  }

  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook de eventos de pagamento do gateway (Stripe/Asaas)' })
  async handleBillingWebhook(@Body() payload: any) {
    return this.subscriptionsService.handleBillingWebhook(payload);
  }
}
