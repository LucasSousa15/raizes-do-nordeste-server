import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from 'src/modules/accounts/domain/@types/users';
import { hasPermission } from 'src/modules/auth/domain/permissions/role-permissions';
import { CurrentUser } from 'src/modules/auth/infra/http/decorators/current-user.decorator';
import { RequirePermission } from 'src/modules/auth/infra/http/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/modules/auth/infra/http/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/modules/auth/infra/http/guards/permission.guard';
import type { AuthenticatedUser } from 'src/modules/auth/infra/http/strategies/jwt-strategy';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import { DeleteOrderUseCase } from '../../../application/use-cases/delete-order.use-case';
import { FindOrdersUseCase } from '../../../application/use-cases/find-orders.use-case';
import { UpdateOrderUseCase } from '../../../application/use-cases/update-order.use-case';
import { CreateOrderDto } from '../dto/create-order.dto';
import { FindOrderDto } from '../dto/find-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import {
  FindOrderView,
  OrderView,
  OrderViewModel,
} from '../view-models/order.view-model';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly findOrdersUseCase: FindOrdersUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar pedidos' })
  @ApiOkResponse({ description: 'Pedidos encontrados com sucesso' })
  async find(
    @Query() findOrderDto: FindOrderDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FindOrderView> {
    const canListAll = hasPermission(currentUser.role, 'list:orders');
    const canReadOwn = hasPermission(currentUser.role, 'read:own-orders');

    if (!canListAll && !canReadOwn) {
      throw new ForbiddenException(
        'Acesso negado. Permissão requerida: list:orders ou read:own-orders',
      );
    }

    const query = { ...findOrderDto };

    if (!canListAll) {
      query.customerId = currentUser.id;
    }

    const orders = await this.findOrdersUseCase.execute(query);

    return {
      order: OrderViewModel.toHTTP(orders),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar pedido por id' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do pedido',
  })
  @ApiOkResponse({ description: 'Pedido encontrado com sucesso' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ order: OrderView }> {
    const orders = await this.findOrdersUseCase.execute({ orderId: id });
    const [order] = orders.data;

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    const canReadAll = hasPermission(currentUser.role, 'read:order');
    const canReadOwn = hasPermission(currentUser.role, 'read:own-orders');

    if (
      !canReadAll &&
      !(canReadOwn && order.customerId === currentUser.id)
    ) {
      throw new ForbiddenException(
        'Acesso negado. Permissão requerida: read:order ou read:own-orders',
      );
    }

    return {
      order: OrderViewModel.toHTTP(order),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('create:order')
  @ApiOperation({ summary: 'Criar pedido' })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({ description: 'Pedido criado com sucesso' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ order: OrderView }> {
    if (
      currentUser.role === UserRole.CUSTOMER &&
      createOrderDto.customerId !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Você só pode criar pedidos para sua própria conta.',
      );
    }

    const order = await this.createOrderUseCase.execute(createOrderDto);

    return {
      order: OrderViewModel.toHTTP(order),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar pedido' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do pedido',
  })
  @ApiBody({ type: UpdateOrderDto })
  @ApiOkResponse({ description: 'Pedido atualizado com sucesso' })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ order: OrderView }> {
    const orders = await this.findOrdersUseCase.execute({ orderId: id });
    const [order] = orders.data;

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    const canUpdateAll = hasPermission(currentUser.role, 'update:order');

    if (updateOrderDto.confirmPayment) {
      const canConfirmOwn =
        hasPermission(currentUser.role, 'create:payment') &&
        order.customerId === currentUser.id;

      if (!canUpdateAll && !canConfirmOwn) {
        throw new ForbiddenException(
          'Acesso negado. Permissão requerida: update:order ou create:payment no próprio pedido',
        );
      }
    } else if (!canUpdateAll) {
      throw new ForbiddenException(
        'Acesso negado. Permissão requerida: update:order',
      );
    }

    const updated = await this.updateOrderUseCase.execute(id, updateOrderDto);

    return {
      order: OrderViewModel.toHTTP(updated),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Cancelar pedido' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do pedido',
  })
  @ApiNoContentResponse({ description: 'Pedido cancelado com sucesso' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    const orders = await this.findOrdersUseCase.execute({ orderId: id });
    const [order] = orders.data;

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    const canCancelAll = hasPermission(currentUser.role, 'cancel:order');
    const canCancelOwn = hasPermission(currentUser.role, 'cancel:own-orders');

    if (
      !canCancelAll &&
      !(canCancelOwn && order.customerId === currentUser.id)
    ) {
      throw new ForbiddenException(
        'Acesso negado. Permissão requerida: cancel:order ou cancel:own-orders',
      );
    }

    await this.deleteOrderUseCase.execute(id);
  }
}
