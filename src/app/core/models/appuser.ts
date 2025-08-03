import { Role } from "./role";

export class AppUser {
  id: number;
  firstName: string;
  lastName: string;
  //role_id: number;
  role: Role;
  userImage?: string;
  user_name?: string;
  password: string;
  email: string;
  city?: string;
  country?: string;
  status: string;
  token?: string;
  api_key?: string;
  designation: string;
  createdAt: string;
}
