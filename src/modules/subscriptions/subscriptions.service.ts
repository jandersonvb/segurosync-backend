import { Injectable, Logger } from '@nestjs/common';
import { ChangePlanDto } from './subscriptions.controller';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  private currentSubscription = {
    planId: 'pro',
    planName: 'Plano Pro (Mais Escolhido)',
    status: 'ativo',
    billingCycle: 'monthly',
    price: 349.00,
    currentPeriodEnd: '2026-11-01T00:00:00Z',
    usage: {
      policiesIssuedThisMonth: 42,
      policiesLimit: 250,
      activeUsers: 3,
      usersLimit: 5,
      whatsappMessagesSent: 184,
      whatsappLimit: 1000
    },
    cardLast4: '4242',
    cardBrand: 'Mastercard Corporate'
  };

  private invoices = [
    {
      id: 'INV-2026-10',
      date: '01/10/2026',
      amount: 349.00,
      status: 'Paga',
      plan: 'Plano Pro (Mensal)',
      receiptNumber: 'NFe-88421',
      pdfUrl: 'https://app.segurosync.com.br/faturas/nfe-88421.pdf'
    },
    {
      id: 'INV-2026-09',
      date: '01/09/2026',
      amount: 349.00,
      status: 'Paga',
      plan: 'Plano Pro (Mensal)',
      receiptNumber: 'NFe-82019',
      pdfUrl: 'https://app.segurosync.com.br/faturas/nfe-82019.pdf'
    }
  ];

  async getCurrentPlan() {
    return this.currentSubscription;
  }

  async getInvoices() {
    return this.invoices;
  }

  async changePlan(dto: ChangePlanDto) {
    this.logger.log(`Alteração de plano solicitada: ${dto.targetPlan} (${dto.billingCycle})`);
    this.currentSubscription.planId = dto.targetPlan;
    this.currentSubscription.billingCycle = dto.billingCycle;

    if (dto.targetPlan === 'enterprise') {
      this.currentSubscription.planName = 'Plano Enterprise';
      this.currentSubscription.price = dto.billingCycle === 'yearly' ? 639.00 : 799.00;
      this.currentSubscription.usage.policiesLimit = 999999;
      this.currentSubscription.usage.usersLimit = 999999;
    } else if (dto.targetPlan === 'starter') {
      this.currentSubscription.planName = 'Plano Starter';
      this.currentSubscription.price = dto.billingCycle === 'yearly' ? 119.00 : 149.00;
      this.currentSubscription.usage.policiesLimit = 50;
      this.currentSubscription.usage.usersLimit = 1;
    }

    return {
      success: true,
      newPlan: this.currentSubscription,
      message: `Assinatura atualizada com sucesso para ${this.currentSubscription.planName}!`
    };
  }

  async handleBillingWebhook(payload: any) {
    this.logger.log(`[BILLING_WEBHOOK] Evento de pagamento processado: ${payload?.type || 'invoice.paid'}`);
    return { received: true };
  }
}
