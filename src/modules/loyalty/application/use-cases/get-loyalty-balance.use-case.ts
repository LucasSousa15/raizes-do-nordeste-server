import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/modules/accounts/domain/@types/users';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';
import { UserNotFoundError } from 'src/modules/accounts/application/errors/user-not-found.error';
import { LoyaltyCustomersOnlyError } from '../errors/customers-only.error';

export type LoyaltyBalance = {
  customerId: string;
  points: number;
  consent: boolean;
  consentAt: Date | null;
};

@Injectable()
export class GetLoyaltyBalanceUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(userId: string): Promise<LoyaltyBalance> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.role !== UserRole.CUSTOMER || !user.customerData) {
      throw new LoyaltyCustomersOnlyError();
    }

    return {
      customerId: user.id,
      points: user.customerData.points,
      consent: user.customerData.consent,
      consentAt: user.customerData.consentAt,
    };
  }
}
