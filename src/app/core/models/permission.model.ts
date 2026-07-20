export interface Permission {
  id: number;
  permission: string;
  description: string;
  createdAt: string;
  isVisible?: boolean;
  isRequestable?: boolean;
  group?: string;
}

// GET /apis/permissions/master-permissions returns the catalogue grouped
// by `group` (permissions with no group fall into the server's "Ungrouped"
// bucket), not as a flat Permission[].
export interface PermissionGroup {
  group: string;
  permissions: Permission[];
}

// GET /apis/permissions/requestable — same grouped shape as master-permissions,
// pre-filtered server-side to isRequestable && isVisible, with two per-user
// flags added so the UI can grey out what's already settled.
export interface RequestablePermission extends Permission {
  alreadyGranted: boolean;
  requestPending: boolean;
}

export interface RequestablePermissionGroup {
  group: string;
  permissions: RequestablePermission[];
}

export type PermissionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PermissionRequestPerson {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface PermissionRequest {
  id: number;
  userId: number;
  permissionId: number;
  resourceType?: string | null;
  resourceId?: number | null;
  comment: string;
  status: PermissionRequestStatus;
  reviewedBy?: number | null;
  reviewComment?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  user?: PermissionRequestPerson;
  reviewer?: PermissionRequestPerson;
  permission?: Permission;
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
