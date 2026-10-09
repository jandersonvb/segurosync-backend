import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './auth.controller';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password?: string) {
    this.logger.log(`Tentativa de login para o e-mail: ${email}`);

    // Perfis padrão homologados
    const demoAccounts: Record<string, any> = {
      'admin@horizonte.com.br': {
        id: 'usr-admin-01',
        name: 'Carlos Drummond',
        email: 'admin@horizonte.com.br',
        role: 'ADMIN',
        roleTitle: 'Diretor Geral & Sócio',
        susepCode: '10.204598-0',
        brokerageId: 'brok-01',
        brokerageName: 'Horizonte Corretora de Seguros',
      },
      'corretor@horizonte.com.br': {
        id: 'usr-corr-02',
        name: 'Rodrigo Medeiros',
        email: 'corretor@horizonte.com.br',
        role: 'CORRETOR',
        roleTitle: 'Corretor Técnico SUSEP',
        susepCode: '10.204598-0',
        brokerageId: 'brok-01',
        brokerageName: 'Horizonte Corretora de Seguros',
      },
      'produtor@horizonte.com.br': {
        id: 'usr-prod-03',
        name: 'Fernanda Salgado',
        email: 'produtor@horizonte.com.br',
        role: 'PRODUTOR',
        roleTitle: 'Produtora Parceira (Repasse 40%)',
        producerId: 'prod-77',
        producerSplitRate: 40,
        brokerageId: 'brok-01',
        brokerageName: 'Horizonte Corretora de Seguros',
      },
    };

    const user = demoAccounts[email.toLowerCase().trim()];

    if (user) {
      return {
        ...user,
        accessToken: `jwt_token_${user.id}_${Date.now()}`,
      };
    }

    // Suporte dinâmico para novos usuários cadastrados
    return {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: 'CORRETOR',
      roleTitle: 'Corretor Habilitado',
      brokerageId: 'brok-01',
      brokerageName: 'Horizonte Corretora de Seguros',
      susepCode: '10.204598-0',
      accessToken: `jwt_token_${Date.now()}`,
    };
  }

  async register(dto: RegisterDto) {
    this.logger.log(`Registrando nova corretora/usuário: ${dto.name} (${dto.email})`);

    return {
      id: `usr-${Date.now()}`,
      name: dto.name,
      email: dto.email,
      role: dto.role || 'CORRETOR',
      brokerageName: dto.brokerageName || 'Minha Corretora de Seguros',
      susepCode: dto.susepCode || '10.204598-0',
      accessToken: `jwt_token_${Date.now()}`,
    };
  }

  async getProfile(authHeader?: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }
    return {
      id: 'usr-admin-01',
      name: 'Carlos Drummond',
      email: 'admin@horizonte.com.br',
      role: 'ADMIN',
      brokerageName: 'Horizonte Corretora de Seguros',
    };
  }
}
