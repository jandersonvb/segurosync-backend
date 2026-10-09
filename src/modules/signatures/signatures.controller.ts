import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SignaturesService } from './signatures.service';

export class CreateSignatureRequestDto {
  title: string;
  clientName: string;
  document: string; // CPF or CNPJ
  clientPhone: string;
  clientEmail: string;
  insurerName: string;
  branch: string;
  totalPremium: number;
  commissionAmount: number;
  sendViaWhatsApp?: boolean;
}

export class ConfirmSignatureDto {
  signerName: string;
  document: string;
  signatureBase64?: string;
  otpToken?: string;
  ipAddress?: string;
  deviceInfo?: string;
  termsAccepted: boolean;
  lgpdAccepted: boolean;
}

@ApiTags('Assinatura Eletrônica & E-Signature (MP 2.200-2 / SUSEP)')
@Controller('signatures')
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar documentos em trânsito de assinatura' })
  async listDocuments(
    @Query('status') status?: string,
    @Query('search') search?: string
  ) {
    return this.signaturesService.findAll({ status, search });
  }

  @Get(':protocol')
  @ApiOperation({ summary: 'Obter detalhes da proposta para assinatura pelo segurado' })
  @ApiParam({ name: 'protocol', example: 'SYNC-SIGN-2026-9041' })
  async getByProtocol(@Param('protocol') protocol: string) {
    return this.signaturesService.findByProtocol(protocol);
  }

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar e disparar link de assinatura por WhatsApp/SMS' })
  async sendDocument(@Body() dto: CreateSignatureRequestDto) {
    return this.signaturesService.createAndSend(dto);
  }

  @Post(':protocol/sign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar assinatura com validação 2FA e hash SHA-256' })
  async confirmSignature(
    @Param('protocol') protocol: string,
    @Body() dto: ConfirmSignatureDto
  ) {
    return this.signaturesService.signDocument(protocol, dto);
  }

  @Get(':protocol/audit-dossier')
  @ApiOperation({ summary: 'Emitir Certificado de Autenticidade e Dossiê Probatório' })
  async getAuditDossier(@Param('protocol') protocol: string) {
    return this.signaturesService.getAuditDossier(protocol);
  }

  @Post('webhooks/provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook de retorno de provedores (ZapSign, Clicksign, DocuSign)' })
  async handleWebhook(@Body() payload: any) {
    return this.signaturesService.handleProviderWebhook(payload);
  }
}
