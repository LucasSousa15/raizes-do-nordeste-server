
export interface PaginatedUsers {
  data: IUser[];
  meta: {
    totalItems: number;
    lastPage: number;
    currentPage: number;
    itemsPerPage: number;
  }
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended"
}

export enum UserRole {
  ADMIN = "admin",
  STAFF = "staff",
  CUSTOMER = "customer"
}

export enum UserProfile {
  KITCHEN = "kitchen",
  WAITER = "waiter",
  CASHIER = "cashier",
}

export interface Customer {
  id: string;
  cpf: string;
  consent: boolean;
  consentAt: Date;
  points: number;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  customer?: Customer;
  profile?: UserProfile;
}

