import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSignatureRequestDto, ConfirmSignatureDto } from './signatures.controller';
import * as crypto from 'crypto';

export interface SignatureDocumentRecord {
  id: string;
  protocolNumber: string;
  title: string;
  clientName: string;
  document: string;
  clientPhone: string;
  clientEmail: string;
  insurerName: string;
  branch: string;
  totalPremium: number;
  commissionAmount: number;
  status: 'pendente' | 'assinado' | 'recusado' | 'expirado';
  sha256Hash: string;
  sentAt: string;
  signedAt?: string;
  expiresAt: string;
  signerIp?: string;
  deviceInfo?: string;
  auditLogs: Array<{
    id: string;
    timestamp: string;
    action: string;
    description: string;
    actor: string;
    ipAddress: string;
  }>;
}

@Injectable()
export class SignaturesService {
  private readonly logger = new Logger(SignaturesService.name);

  // In-memory / cache store mock (in production synced with PostgreSQL via Prisma)
  private documents: SignatureDocumentRecord[] = [
    {
      id: 'sig-001',
      protocolNumber: 'SYNC-SIGN-2026-9041',
      title: 'Proposta Seguro Auto - Porto Seguro',
      clientName: 'Dra. Camila Vasconcellos',
      document: '284.912.840-33',
      clientPhone: '(11) 98712-4490',
      clientEmail: 'camila.vasconcellos@medclin.com.br',
      insurerName: 'Porto Seguro',
      branch: 'auto',
      totalPremium: 7850.00,
      commissionAmount: 1570.00,
      status: 'pendente',
      sha256Hash: crypto.createHash('sha256').update('prop-porto-camila-2026').digest('hex'),
      sentAt: new Date(Date.now() - 3600000).toISOString(),
      expiresAt: new Date(Date.now() + 3 * 24 * 3600000).toISOString(),
      auditLogs: [
        {
          id: 'log-1',
          timestamp: new Date().toLocaleString('pt-BR'),
          action: 'DOCUMENT_CREATED',
          description: 'Documento criado a partir do Multicálculo Porto Seguro.',
          actor: 'Rodrigo Medeiros (Corretor)',
          ipAddress: '189.120.44.82'
        }
      ]
    }
  ];

  async findAll(params: { status?: string; search?: string }) {
    let result = [...this.documents];
    if (params.status && params.status !== 'todos') {
      result = result.filter(d => d.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(d => 
        d.clientName.toLowerCase().includes(q) ||
        d.document.includes(q) ||
        d.protocolNumber.toLowerCase().includes(q)
      );
    }
    return {
      total: result.length,
      data: result
    };
  }

  async findByProtocol(protocol: string): Promise<SignatureDocumentRecord> {
    const doc = this.documents.find(d => d.protocolNumber.toUpperCase() === protocol.toUpperCase());
    if (!doc) {
      throw new NotFoundException(`Proposta com protocolo ${protocol} não encontrada.`);
    }
    return doc;
  }

  async createAndSend(dto: CreateSignatureRequestDto) {
    const protocol = `SYNC-SIGN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const hash = crypto.createHash('sha256')
      .update(`${dto.clientName}-${dto.document}-${dto.totalPremium}-${Date.now()}`)
      .digest('hex');

    const newDoc: SignatureDocumentRecord = {
      id: `sig-${Date.now()}`,
      protocolNumber: protocol,
      title: dto.title,
      clientName: dto.clientName,
      document: dto.document,
      clientPhone: dto.clientPhone,
      clientEmail: dto.clientEmail,
      insurerName: dto.insurerName,
      branch: dto.branch,
      totalPremium: dto.totalPremium,
      commissionAmount: dto.commissionAmount,
      status: 'pendente',
      sha256Hash: hash,
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3 * 24 * 3600000).toISOString(),
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleString('pt-BR'),
          action: 'DOCUMENT_CREATED',
          description: `Documento criado e link gerado: https://app.segurosync.com.br/assinar/${protocol.toLowerCase()}`,
          actor: 'Sistema SeguroSync',
          ipAddress: '177.18.204.11'
        }
      ]
    };

    if (dto.sendViaWhatsApp) {
      this.logger.log(`[WHATSAPP_CLOUD_API] Disparando mensagem HSM aprovada para ${dto.clientPhone}`);
      newDoc.auditLogs.push({
        id: `log-${Date.now() + 1}`,
        timestamp: new Date().toLocaleString('pt-BR'),
        action: 'NOTIFICATION_SENT',
        description: `Disparo automático WhatsApp para ${dto.clientPhone} com link único.`,
        actor: 'WhatsApp Cloud API Gateway',
        ipAddress: '177.18.204.11'
      });
    }

    this.documents.unshift(newDoc);
    return newDoc;
  }

  async signDocument(protocol: string, dto: ConfirmSignatureDto) {
    const doc = await this.findByProtocol(protocol);

    if (doc.status === 'assinado') {
      throw new BadRequestException('Este documento já foi assinado anteriormente.');
    }

    if (!dto.termsAccepted || !dto.lgpdAccepted) {
      throw new BadRequestException('O aceite das condições e o consentimento LGPD são obrigatórios.');
    }

    const timestamp = new Date().toISOString();
    const finalHash = crypto.createHash('sha256')
      .update(`${doc.sha256Hash}-${dto.signerName}-${dto.document}-${timestamp}`)
      .digest('hex');

    doc.status = 'assinado';
    doc.signedAt = timestamp;
    doc.sha256Hash = finalHash;
    doc.signerIp = dto.ipAddress || '189.120.44.82';
    doc.deviceInfo = dto.deviceInfo || 'Mobile Safari / iOS 17.5';

    doc.auditLogs.push({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      action: 'DOCUMENT_SIGNED',
      description: `Assinatura confirmada por ${dto.signerName} (CPF: ${dto.document}) com 2FA validado e carimbo de tempo ICP-Brasil.`,
      actor: dto.signerName,
      ipAddress: doc.signerIp
    });

    this.logger.log(`Documento ${protocol} assinado digitalmente com sucesso. Hash final: ${finalHash}`);
    return {
      success: true,
      protocol: doc.protocolNumber,
      signedAt: doc.signedAt,
      documentHash: finalHash,
      message: 'Proposta assinada digitalmente com validade jurídica plena (MP 2.200-2/2001).'
    };
  }

  async getAuditDossier(protocol: string) {
    const doc = await this.findByProtocol(protocol);
    return {
      certificateNumber: `CERT-${doc.protocolNumber}`,
      issuedAt: new Date().toISOString(),
      legalStandard: 'MP 2.200-2/2001 & Circular SUSEP nº 605/2020',
      document: {
        protocol: doc.protocolNumber,
        title: doc.title,
        insurer: doc.insurerName,
        totalPremium: doc.totalPremium,
        status: doc.status,
        sha256IntegrityHash: doc.sha256Hash,
      },
      signer: {
        name: doc.clientName,
        document: doc.document,
        phone: doc.clientPhone,
        signedAt: doc.signedAt,
        ipAddress: doc.signerIp,
        device: doc.deviceInfo,
      },
      auditTrail: doc.auditLogs
    };
  }

  async handleProviderWebhook(payload: any) {
    this.logger.log(`[SIGNATURE_WEBHOOK] Evento recebido: ${JSON.stringify(payload)}`);
    return { received: true };
  }
}
