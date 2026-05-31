import { Injectable } from '@nestjs/common';
import { FindUserReq, FindUserRes, IUser, PaginatedUsers, UserStatus } from '../../@types/users';
import { UsersRepository } from '../../domain/repositories/users.repositories';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly userRepository: UsersRepository) {}

  async execute(data: FindUserReq): Promise<FindUserRes> {
    const page = Number(data.page ?? 1);
    const limit = Number(data.limit ?? 10);

    let user: PaginatedUsers | IUser | null = null;
    if (data?.id) {
      user = await this.userRepository.findById(data.id);
    } else if (data.email) {
      user = await this.userRepository.findByEmail(data.email);
    } else if (data?.status) {
      user = await this.userRepository.findByStatus(data.status, page, limit);
    } else {
      user = await this.userRepository.findMany(page, limit);
    }

    return { user };
  }
}
