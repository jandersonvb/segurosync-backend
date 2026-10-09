import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

export class LoginDto {
  email: string;
  password?: string;
}

export class RegisterDto {
  name: string;
  email: string;
  password?: string;
  role?: 'ADMIN' | 'CORRETOR' | 'PRODUTOR';
  brokerageName?: string;
  cnpjOrCpf?: string;
  susepCode?: string;
}

@ApiTags('Autenticação & Controle de Acesso (RBAC)')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica usuário e retorna sessão JWT com claims de role e corretora' })
  @ApiResponse({ status: 200, description: 'Usuário autenticado com sucesso' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password || '');
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastra nova corretora ou produtor parceiro' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado atual' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.headers.authorization);
  }
}
