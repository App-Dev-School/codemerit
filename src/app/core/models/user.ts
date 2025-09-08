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
  designation: number;
  userDesignation: {
    id: number,
    title: string,
    slug:string
  }
  token!: string;
  country: string;
  accountStatus!: string;
  createdAt!: string;
}
