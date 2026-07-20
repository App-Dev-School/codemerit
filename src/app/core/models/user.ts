import { Role } from './role';
import { UserJobRole } from './userJobRole.model';

// Shape returned by the login response's `permissions` array
// (LoginResponseDto.permissions on the backend) — distinct from
// UserPermissionGrant (user-profile.model.ts), which comes from the
// full-profile endpoint and carries resourceName/grantedAt instead.
export interface LoginUserPermission {
  id: number;
  userId: number;
  permissionId: number;
  permissionName: string;
  resourceType: string | null;
  resourceId: number | null;
  isVisible: boolean;
}

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
  permissions?: LoginUserPermission[];
}
