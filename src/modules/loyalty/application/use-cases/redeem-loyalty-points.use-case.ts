import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/modules/accounts/domain/@types/users';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';
import { UserNotFoundError } from 'src/modules/accounts/application/errors/user-not-found.error';
import { ConsentRequiredError } from '../errors/consent-required.error';
import { InsufficientPointsError } from '../errors/insufficient-points.error';
import { LoyaltyCustomersOnlyError } from '../errors/customers-only.error';

export type RedeemLoyaltyPointsReq = {
  userId: string;
  points: number;
};

export type RedeemLoyaltyPointsResult = {
  customerId: string;
  redeemedPoints: number;
  remainingPoints: number;
};

@Injectable()
export class RedeemLoyaltyPointsUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(data: RedeemLoyaltyPointsReq): Promise<RedeemLoyaltyPointsResult> {
    const user = await this.usersRepository.findById(data.userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.role !== UserRole.CUSTOMER || !user.customerData) {
      throw new LoyaltyCustomersOnlyError();
    }

    if (!user.customerData.consent) {
      throw new ConsentRequiredError();
    }

    if (data.points <= 0) {
      throw new InsufficientPointsError();
    }

    if (user.customerData.points < data.points) {
      throw new InsufficientPointsError();
    }

    const remainingPoints = user.customerData.points - data.points;

    await this.usersRepository.update({
      ...user,
      customerData: {
        ...user.customerData,
        points: remainingPoints,
        updatedAt: new Date(),
      },
    });

    return {
      customerId: user.id,
      redeemedPoints: data.points,
      remainingPoints,
    };
  }
}
