
export interface PaginatedUsers {
  data: IUser[];
  meta: {
    totalItems: number;
    lastPage: number;
    currentPage: number;
    itemsPerPage: number;
  }
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  profile?: string;
}