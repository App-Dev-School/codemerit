import { Role } from './role';
import { UserJobRole } from './userJobRole.model';

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
  userJobRoles: UserJobRole[]
  token!: string;
  country: string;
  accountStatus!: string;
  createdAt!: string;
}
