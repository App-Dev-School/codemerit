import { Role } from './role';

export class User {
  id!: number;
  userImage!: string;
  username!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  role: Role;
  email : string;
  designation: string;
  token!: string;
  accountStatus!: string;
  createdAt!: string;
}
