import { Injectable } from '@nestjs/common';
import { CreateUserReq, IUser, UserRole, UserStatus } from '../../@types/users';
import { UsersRepository } from '../../domain/repositories/users.repositories';
import { ProfileRequiredError } from '../errors/profile-required.error';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PersonalInfoRequiredError } from '../errors/personal-info-required.error';
import { DataAlreadyUsedError } from '../errors/data-already-used.error';

export type CreateUserRes = {
  user: IUser;
};

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UsersRepository) {}

  async execute(data: CreateUserReq): Promise<CreateUserRes> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new DataAlreadyUsedError();
    }

    if (data.role === UserRole.STAFF && !data.profile) {
      throw new ProfileRequiredError();
    }

    if (data.role === UserRole.CUSTOMER && !data.customerData) {
      throw new PersonalInfoRequiredError();
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const id = crypto.randomUUID();

    const user = await this.userRepository.create({
      id,
      name: data.name,
      email: data.email,
      password: passwordHash,
      role: data.role,
      status: UserStatus.ACTIVE,
      profile: data.profile,
      customerData:
        data.role === UserRole.CUSTOMER
          ? {
              id: crypto.randomUUID(),
              cpf: data.customerData!.cpf,
              consent: true,
              consentAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
              points: 0,
            }
          : undefined,
    });

    return { user };
  }
}
