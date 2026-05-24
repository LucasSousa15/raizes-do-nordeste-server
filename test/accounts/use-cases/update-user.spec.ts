import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserUseCase } from 'src/modules/accounts/application/use-cases/update-user.user.case';
import { InMemoryUsersRepository } from '../repositories/in-memory.users.repository';
import { UserNotFoundError } from 'src/modules/accounts/application/errors/user-not-found.error';

import { UserProfile, UserRole, UserStatus } from 'src/modules/accounts/@types/users';
import * as bcrypt from 'bcryptjs';
import { DataAlreadyUsedError } from 'src/modules/accounts/application/errors/data-already-used.error';
import { ProfileRequiredError } from 'src/modules/accounts/application/errors/profile-required.error';
import { PersonalInfoRequiredError } from 'src/modules/accounts/application/errors/personal-info-required.error';

describe('Update user tests', () => {
    let usersRepository: InMemoryUsersRepository;
    let sut: UpdateUserUseCase;

    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        sut = new UpdateUserUseCase(usersRepository);
    });

    it('should update user name, email, status and password successfully', async () => {
        const existingUser = {
            id: 'user-1',
            name: 'Old Name',
            email: 'old@email.com',
            password: await bcrypt.hash('oldpass', 10),
            status: UserStatus.ACTIVE,
            role: UserRole.ADMIN,
        };
        await usersRepository.create(existingUser);

        const updateData = {
            id: 'user-1',
            name: 'New Name',
            email: 'new@email.com',
            password: 'newpassword',
            status: UserStatus.INACTIVE,
        };

        const result = await sut.execute(updateData);

        expect(result.user).not.toBeNull();
        expect(result.user?.id).toBe('user-1');
        expect(result.user?.name).toBe('New Name');
        expect(result.user?.email).toBe('new@email.com');
        expect(result.user?.status).toBe(UserStatus.INACTIVE);

        const updatedUser = await usersRepository.findById('user-1');
        const isPasswordValid = await bcrypt.compare('newpassword', updatedUser!.password);
        expect(isPasswordValid).toBe(true);
        expect(updatedUser?.role).toBe(UserRole.ADMIN);
    });

    it('should keep original password when no new password is provided', async () => {  
        const originalPasswordHash = await bcrypt.hash('originalpass', 10);
        const existingUser = {
            id: 'user-1',
            name: 'Name',
            email: 'email@test.com',
            password: originalPasswordHash,
            status: UserStatus.ACTIVE,
            role: UserRole.ADMIN,
        };
        await usersRepository.create(existingUser);


        const result = await sut.execute({
            id: 'user-1',
            name: 'Updated Name',
        });

        const userAfterUpdate = await usersRepository.findById('user-1');
        expect(userAfterUpdate?.password).toBe(originalPasswordHash);
        expect(result.user?.name).toBe('Updated Name');
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
        await expect(sut.execute({ id: 'non-existent-id' })).rejects.toThrow(UserNotFoundError);
    });

    it('should throw EmailAlreadyExistsError when updating to an email already in use by another user', async () => {
        // Arrange
        const user1 = {
            id: 'user-1',
            name: 'User One',
            email: 'one@email.com',
            password: 'hash',
            status: UserStatus.ACTIVE,
            role: UserRole.ADMIN,
        };
        const user2 = {
            id: 'user-2',
            name: 'User Two',
            email: 'two@email.com',
            password: 'hash',
            status: UserStatus.ACTIVE,
            role: UserRole.STAFF,
            profile: UserProfile.KITCHEN
        };
        await usersRepository.create(user1);
        await usersRepository.create(user2);


        await expect(sut.execute({
            id: 'user-1',
            email: 'two@email.com',
        })).rejects.toThrow(DataAlreadyUsedError);
    });

    it('should allow updating to the same email (no uniqueness conflict)', async () => {
        const user = {
            id: 'user-1',
            name: 'Name',
            email: 'same@email.com',
            password: 'hash',
            status: UserStatus.ACTIVE,
            role: UserRole.CUSTOMER,
        };
        await usersRepository.create(user);

        const result = await sut.execute({
            id: 'user-1',
            email: 'same@email.com',
            name: 'New Name',
        });

        expect(result.user?.email).toBe('same@email.com');
        expect(result.user?.name).toBe('New Name');
    });

    it('should throw ProfileRequiredError when updating role to staff without profile', async () => {
        await usersRepository.create({
            id: 'user-1',
            name: 'Name',
            email: 'email@test.com',
            password: 'hash',
            status: UserStatus.ACTIVE,
            role: UserRole.ADMIN,
        });

        await expect(sut.execute({
            id: 'user-1',
            role: UserRole.STAFF,
        })).rejects.toThrow(ProfileRequiredError);
    });

    it('should update role to staff when profile is provided', async () => {
        await usersRepository.create({
            id: 'user-1',
            name: 'Name',
            email: 'email@test.com',
            password: 'hash',
            status: UserStatus.ACTIVE,
            role: UserRole.ADMIN,
        });

        const result = await sut.execute({
            id: 'user-1',
            role: UserRole.STAFF,
            profile: UserProfile.KITCHEN,
        });

        const updatedUser = await usersRepository.findById('user-1');
        expect(result.user.role).toBe(UserRole.STAFF);
        expect(updatedUser?.profile).toBe(UserProfile.KITCHEN);
    });

    it('should throw PersonalInfoRequiredError when updating role to customer without customer data', async () => {
        await usersRepository.create({
            id: 'user-1',
            name: 'Name',
            email: 'email@test.com',
            password: 'hash',
            status: UserStatus.ACTIVE,
            role: UserRole.ADMIN,
        });

        await expect(sut.execute({
            id: 'user-1',
            role: UserRole.CUSTOMER,
        })).rejects.toThrow(PersonalInfoRequiredError);
    });

    it('should update role to customer when customer data is provided', async () => {
        const consentAt = new Date('2026-05-17T00:00:00.000Z');
        const updatedAt = new Date('2026-05-18T00:00:00.000Z');

        await usersRepository.create({
            id: 'user-1',
            name: 'Name',
            email: 'email@test.com',
            password: 'hash',
            status: UserStatus.ACTIVE,
            role: UserRole.ADMIN,
        });

        const result = await sut.execute({
            id: 'user-1',
            role: UserRole.CUSTOMER,
            customerData: {
                cpf: '123.456.789-00',
                consent: true,
                consentAt,
                points: 10,
                updatedAt,
            },
        });

        const updatedUser = await usersRepository.findById('user-1');
        expect(result.user.role).toBe(UserRole.CUSTOMER);
        expect(updatedUser?.customerData).toEqual(expect.objectContaining({
            cpf: '123.456.789-00',
            consent: true,
            consentAt,
            points: 10,
            updatedAt,
        }));
        expect(updatedUser?.customerData?.id).toEqual(expect.any(String));
        expect(updatedUser?.customerData?.createdAt).toBeInstanceOf(Date);
    });

    it('should return only the required fields (id, name, email, status, role)', async () => {

        const user = {
            id: 'user-1',
            name: 'Original',
            email: 'orig@email.com',
            password: 'hash',
            status: UserStatus.ACTIVE,
            role: UserRole.ADMIN,
        };
        await usersRepository.create(user);
        const result = await sut.execute({ id: 'user-1', name: 'Updated' });

        expect(result.user).toHaveProperty('id');
        expect(result.user).toHaveProperty('name');
        expect(result.user).toHaveProperty('email');
        expect(result.user).toHaveProperty('status');
        expect(result.user).toHaveProperty('role');
        expect(Object.keys(result.user!)).toHaveLength(5); 
        expect(result.user?.role).toBe(UserRole.ADMIN); 
    });
});
