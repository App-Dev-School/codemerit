export interface Permission {
  id: number;
  permission: string;
  description: string;
  createdAt: string;
}

export interface UserPermission {
  id?: number;
  permissionId?: number;
  permissionName?: string;
  resourceType?: string;
  resourceId?: number;
  resourceName?: string;
  user?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    designation?: number;
    createdAt?: string;
  };
}

export class UserPermissionItem implements UserPermission {
  id?: number;
  permissionId?: number;
  permissionName?: string;
  resourceType?: string;
  resourceId?: number;
  resourceName?: string;
  user?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    designation?: number;
    createdAt?: string;
  };

  constructor(data: Partial<UserPermissionItem> = {}) {
    this.id = data.id ?? this.getRandomID();
    this.permissionId = data.permissionId ?? 0;
    this.permissionName = data.permissionName ?? '';
    this.resourceType = data.resourceType ?? '';
    this.resourceId = data.resourceId ?? 0;
    this.resourceName = data.resourceName ?? '';
    this.user = data.user ?? {
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      designation: 0,
      createdAt: ''
    };
  }

  private getRandomID(): number {
    return Math.floor(Math.random() * 100000);
  }
}
