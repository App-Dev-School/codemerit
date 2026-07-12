export class CertificationTrackItem {
  id?: number;
  jobRoleId: number;
  jobRoleTitle?: string;
  title: string;
  description?: string;
  sortOrder: number;
  isPublished: boolean;
  subjectTrackCount?: number;
  subjectTracks?: any[];

  constructor(item: Partial<CertificationTrackItem> = {}) {
    this.id = item.id;
    this.jobRoleId = item.jobRoleId ?? 0;
    this.jobRoleTitle = item.jobRoleTitle ?? '';
    this.title = item.title ?? '';
    this.description = item.description ?? '';
    this.sortOrder = item.sortOrder ?? 1;
    this.isPublished = item.isPublished ?? true;
    this.subjectTrackCount = item.subjectTrackCount ?? 0;
    this.subjectTracks = item.subjectTracks ?? [];
  }
}
