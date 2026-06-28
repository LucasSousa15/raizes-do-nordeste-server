import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/modules/auth/infra/http/decorators/current-user.decorator';
import { RequirePermission } from 'src/modules/auth/infra/http/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/modules/auth/infra/http/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/modules/auth/infra/http/guards/permission.guard';
import type { AuthenticatedUser } from 'src/modules/auth/infra/http/strategies/jwt-strategy';
import { GetLoyaltyBalanceUseCase } from '../../../application/use-cases/get-loyalty-balance.use-case';
import { RedeemLoyaltyPointsUseCase } from '../../../application/use-cases/redeem-loyalty-points.use-case';
import { GetLoyaltyHistoryUseCase } from '../../../application/use-cases/get-loyalty-history.use-case';
import { RedeemLoyaltyPointsDto } from '../dto/redeem-loyalty-points.dto';

@ApiTags('Loyalty')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(
    private readonly getLoyaltyBalanceUseCase: GetLoyaltyBalanceUseCase,
    private readonly redeemLoyaltyPointsUseCase: RedeemLoyaltyPointsUseCase,
    private readonly getLoyaltyHistoryUseCase: GetLoyaltyHistoryUseCase,
  ) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('read:own-loyalty')
  @ApiOperation({ summary: 'Consultar saldo de pontos do cliente autenticado' })
  @ApiOkResponse({ description: 'Saldo retornado com sucesso' })
  async getBalance(@CurrentUser() currentUser: AuthenticatedUser) {
    const balance = await this.getLoyaltyBalanceUseCase.execute(currentUser.id);

    return { loyalty: balance };
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('redeem:own-loyalty')
  @ApiOperation({ summary: 'Resgatar pontos de fidelidade' })
  @ApiBody({ type: RedeemLoyaltyPointsDto })
  @ApiOkResponse({ description: 'Pontos resgatados com sucesso' })
  async redeem(
    @Body() body: RedeemLoyaltyPointsDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const result = await this.redeemLoyaltyPointsUseCase.execute({
      userId: currentUser.id,
      points: body.points,
    });

    return { loyalty: result };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('read:own-loyalty')
  @ApiOperation({ summary: 'Consultar histórico de pontos do cliente autenticado' })
  @ApiOkResponse({ description: 'Histórico retornado com sucesso' })
  async getHistory(@CurrentUser() currentUser: AuthenticatedUser) {
    const history = await this.getLoyaltyHistoryUseCase.execute(currentUser.id);
    return { loyalty: { history } };
  }
}
