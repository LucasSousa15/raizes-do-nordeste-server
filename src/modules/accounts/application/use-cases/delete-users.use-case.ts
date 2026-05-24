import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../domain/repositories/users.repositories";
import { UserNotFoundError } from "../errors/user-not-found.error";

export type DeleteUserReq = {
    id: string;
}

export type DeleteUserRes = void;

@Injectable()
export class DeleteUserUseCase {
    constructor(private readonly userRepository: UsersRepository) {}

    async execute(data: DeleteUserReq): Promise<DeleteUserRes> {
        const user = await this.userRepository.findById(data.id);
        
        if (!user) {
            throw new UserNotFoundError();
        }

        await this.userRepository.delete(data.id);

    }

}