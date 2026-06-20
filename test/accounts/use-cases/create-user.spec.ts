import { CreateUserUseCase } from "src/modules/accounts/application/use-cases/create-user.use-case";
import { InMemoryUsersRepository } from "../repositories/in-memory.users.repository";
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { UserProfile, UserRole, UserStatus, } from "src/modules/accounts/domain/@types/users";
import { ProfileRequiredError } from "src/modules/accounts/application/errors/profile-required.error";
import { PersonalInfoRequiredError } from "src/modules/accounts/application/errors/personal-info-required.error";
import { User } from "src/modules/accounts/domain/entities/user.entity";
import { DataAlreadyUsedError } from "src/modules/accounts/application/errors/data-already-used.error";

let usersRepository: InMemoryUsersRepository;
let sut: CreateUserUseCase;

describe('Create users tests', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        sut = new CreateUserUseCase(usersRepository);
    })

    afterEach(() => {
        usersRepository.items = [];
    });

    it('should be able to create a admin user', async () => {
        const { user } = await sut.execute({
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: 'password',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
        });

        expect(user).toBeInstanceOf(Object);
        expect(user).toHaveProperty('id');
        expect(user.status).toBe(UserStatus.ACTIVE);
        expect(user.profile).toBe(undefined);

    }

    )

    it('should be able to create a staff user with profile', async () => {
        const { user } = await sut.execute({
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'password',
            role: UserRole.STAFF,
            status: UserStatus.ACTIVE,
            profile: UserProfile.KITCHEN
        });

        expect(user).toBeInstanceOf(Object);
        expect(user).toHaveProperty('id');
        expect(user.status).toBe(UserStatus.ACTIVE);
        expect(user.profile).toEqual(UserProfile.KITCHEN);
    });

    it ('should not be able to create a staff user without profile', async () => {
        await expect(() => sut.execute({
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'password',
            role: UserRole.STAFF,
            status: UserStatus.ACTIVE,
        })).rejects.toBeInstanceOf(ProfileRequiredError);
    });

    it('should not be able to create a customer user without personal info', async () => {
        await expect(() => sut.execute({
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'password',
            role: UserRole.CUSTOMER,
            status: UserStatus.ACTIVE,
        })).rejects.toBeInstanceOf(PersonalInfoRequiredError);
    });

    it ('should not be able to create a user with existing email', async () => {
        await sut.execute({
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: 'password',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
        });

        await expect(() => sut.execute({
            name: 'Jane Doe',
            email: 'john.doe@example.com',
            password: 'password',
            role: UserRole.STAFF,
            status: UserStatus.ACTIVE,
        })).rejects.toBeInstanceOf(DataAlreadyUsedError);

    });
})