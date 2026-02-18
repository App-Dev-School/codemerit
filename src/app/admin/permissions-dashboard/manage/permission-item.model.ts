import { formatDate } from '@angular/common';
export class permissionsItem {

  id?: number;

  permissionId!: number;
  permissionName!: string;

  resourceId!: number;
  resourceName!: string;
  resourceType?: string;

  userId!: number;
  userName!: string;
  userEmail?: string;

  constructor(data: Partial<permissionsItem> = {}) {

    this.id = data.id ?? this.getRandomID();

    this.permissionId = data.permissionId ?? 0;
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
