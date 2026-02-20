export interface Permission {
  id: number;
  permission: string;
  description: string;
  createdAt: string;
}

export interface UserPermission {
  id?: number;
  permissionIds: number;
  permissionName: string;
  resourceId: number;
  resourceName: string;
  resourceType?: string;
  userId: number;
  userName: string;
  userEmail?: string;
  createdAt?: Date;
}

export class UserPermissionItem implements UserPermission {

  id?: number;
  permissionIds!: number;
  permissionName!: string;

  resourceId!: number;
  resourceName!: string;
  resourceType?: string;

  userId!: number;
  userName!: string;
  userEmail?: string;
  createdAt?: Date;

  constructor(data: Partial<UserPermissionItem> = {}) {

    this.id = data.id ?? this.getRandomID();

    this.permissionIds = data.permissionIds ?? 0;
    this.permissionName = data.permissionName ?? '';

    this.resourceId = data.resourceId ?? 0;
    this.resourceName = data.resourceName ?? '';
    this.resourceType = data.resourceType ?? '';

    this.userId = data.userId ?? 0;
    this.userName = data.userName ?? '';
    this.userEmail = data.userEmail ?? '';
  }

  private getRandomID(): number {
    return Math.floor(Math.random() * 100000);
  }
}
