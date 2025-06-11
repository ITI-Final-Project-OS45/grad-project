export type UserRole = 'manager' | 'developer' | 'qc';

export class UserDto {
  _id!: string;
  username!: string;
  displayName!: string;
  email!: string;
  workspaces!: string[];
  role!: UserRole;
  password!: string;
  createdAt?: Date;
}
