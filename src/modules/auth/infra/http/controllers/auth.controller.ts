import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SignInUseCase } from 'src/modules/auth/application/use-cases/sign-in.use-case';
import { CreateRefreshTokenUseCase } from 'src/modules/auth/application/use-cases/create-refresh-token.use-case';
import { CreatePasswordResetUseCase } from 'src/modules/auth/application/use-cases/create-password-reset.use-case';
import { ResetPasswordUseCase } from 'src/modules/auth/application/use-cases/reset-password.use-case';
import { TokenService } from 'src/core/token/models/token.service';
import { RefreshTokenRepository } from 'src/modules/auth/domain/repositories/refresh-token.repositorie';
import {
  CreatePasswordResetResponse,
  SignInResponse,
} from 'src/modules/auth/domain/@types/auth-types';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { AuthenticatedRefreshUser } from '../strategies/jwt-refresh.strategy';
import { SignInDTO } from '../dto/sign-in.dto';
import { RefreshTokenDTO } from '../dto/refresh-token.dto';
import { CreatePasswordResetDTO } from '../dto/create-password-reset.dto';
import { ResetPasswordDTO } from '../dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase,
    private readonly createPasswordResetUseCase: CreatePasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  @Post('sign-in')
  @HttpCode(200)
  @ApiOperation({ summary: 'Entrar' })
  @ApiOkResponse({ description: 'Autenticado com sucesso' })
  async signIn(@Body() signInDTO: SignInDTO): Promise<SignInResponse> {
    return this.signInUseCase.execute(signInDTO);
  }

  @Post('refresh-token')
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Atualizar token de acesso' })
  @ApiBody({ type: RefreshTokenDTO })
  @ApiOkResponse({ description: 'Token atualizado com sucesso' })
  async refreshToken(
    @Body() refreshTokenDTO: RefreshTokenDTO,
    @CurrentUser() user: AuthenticatedRefreshUser,
  ): Promise<SignInResponse> {
    void refreshTokenDTO;

    const accessToken = await this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      verifiedEmail: user.verifiedEmail,
      tokenId: randomUUID(),
    });

    const { refreshToken } = await this.createRefreshTokenUseCase.execute({
      userId: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      verifiedEmail: user.verifiedEmail,
    });

    await this.refreshTokenRepository.delete(user.tokenId);

    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('password-reset')
  @HttpCode(200)
  @ApiOperation({ summary: 'Criar token de redefinição de senha' })
  @ApiOkResponse({ description: 'Token de redefinição criado com sucesso' })
  async createPasswordReset(
    @Body() createPasswordResetDTO: CreatePasswordResetDTO,
  ): Promise<CreatePasswordResetResponse> {
    return this.createPasswordResetUseCase.execute(createPasswordResetDTO);
  }

  @Post('reset-password')
  @HttpCode(204)
  @ApiOperation({ summary: 'Redefinir senha' })
  @ApiNoContentResponse({ description: 'Senha redefinida com sucesso' })
  async resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO): Promise<void> {
    await this.resetPasswordUseCase.execute(resetPasswordDTO);
  }
}
