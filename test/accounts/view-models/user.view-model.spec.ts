import { describe, expect, it } from 'vitest';
import { UserRole, UserStatus } from 'src/modules/accounts/domain/@types/users';
import { UserViewModel } from 'src/modules/accounts/infra/http/view-models/user.view-model';

const user = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'hashed-password',
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
};

describe('User view model', () => {
  it('should not expose user password', () => {
    const result = UserViewModel.toHTTP(user);

    expect(result).not.toHaveProperty('password');
    expect(result).toMatchObject({
      id: 'user-1',
      email: 'john.doe@example.com',
    });
  });

  it('should not expose passwords in paginated users', () => {
    const result = UserViewModel.toHTTP({
      data: [user],
      meta: {
        totalItems: 1,
        lastPage: 1,
        currentPage: 1,
        itemsPerPage: 10,
      },
    });

    expect(result.data[0]).not.toHaveProperty('password');
    expect(result.meta.totalItems).toBe(1);
  });
});
