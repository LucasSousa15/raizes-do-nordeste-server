import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory.users.repository";
import { DeleteUserUseCase } from "src/modules/accounts/application/use-cases/delete-users.use-case";
import { UserRole, UserStatus } from "src/modules/accounts/domain/@types/users";
import { UserNotFoundError } from "src/modules/accounts/application/errors/user-not-found.error";

describe('Delete users tests', () => {
    let usersRepository: InMemoryUsersRepository;
    let sut: DeleteUserUseCase;

    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        sut = new DeleteUserUseCase(usersRepository);
    });

    it('should delete user successfully', async () => {
        const existingUser = {
            id: 'user-1',
            name: 'User Name',
            email: 'user@email.com',
            password: 'hashedpassword',
            status: UserStatus.ACTIVE,
            role: UserRole.ADMIN,
        };
        await usersRepository.create(existingUser);

        await sut.execute({ id: 'user-1' });

        const deletedUser = await usersRepository.findById('user-1');
        expect(deletedUser).toBeNull();
    });

    it('should throw UserNotFoundError when trying to delete a non-existing user', async () => {
        await expect(sut.execute({ id: 'non-existing-user' })).rejects.toThrow(UserNotFoundError);
        
        expect(usersRepository.items.length).toBe(0);
        await expect(usersRepository.findById('non-existing-user')).resolves.toBeNull();
    });
});