import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { PricingController } from './modules/pricing/pricing.controller';
import { PricingService } from './modules/pricing/pricing.service';
import { CommissionsController } from './modules/commissions/commissions.controller';
import { CommissionsService } from './modules/commissions/commissions.service';
import { PoliciesController } from './modules/policies/policies.controller';
import { PoliciesService } from './modules/policies/policies.service';
import { SignaturesController } from './modules/signatures/signatures.controller';
import { SignaturesService } from './modules/signatures/signatures.service';
import { SubscriptionsController } from './modules/subscriptions/subscriptions.controller';
import { SubscriptionsService } from './modules/subscriptions/subscriptions.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AuthController,
    PricingController,
    CommissionsController,
    PoliciesController,
    SignaturesController,
    SubscriptionsController,
  ],
  providers: [
    PrismaService,
    AuthService,
    PricingService,
    CommissionsService,
    PoliciesService,
    SignaturesService,
    SubscriptionsService,
  ],
})
export class AppModule {}
