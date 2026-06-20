import { IUser, PaginatedUsers } from 'src/modules/accounts/domain/@types/users';

export type UserView = Omit<IUser, 'password'>;

export type PaginatedUsersView = Omit<PaginatedUsers, 'data'> & {
  data: UserView[];
};

export type FindUserView = {
  user: UserView | PaginatedUsersView | null;
};

export class UserViewModel {
  static toHTTP(user: IUser): UserView;
  static toHTTP(user: PaginatedUsers): PaginatedUsersView;
  static toHTTP(user: null): null;
  static toHTTP(
    user: IUser | PaginatedUsers | null,
  ): UserView | PaginatedUsersView | null;
  static toHTTP(
    user: IUser | PaginatedUsers | null,
  ): UserView | PaginatedUsersView | null {
    if (!user) return null;

    if ('data' in user) {
      return {
        data: user.data.map((item) => UserViewModel.toHTTP(item)),
        meta: user.meta,
      };
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
