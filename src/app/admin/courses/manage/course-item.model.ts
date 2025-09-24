export class CourseItem {
  id?: number;
  title: string;
  slug?: string;
  description?: string;
  color ?: string;
  isPublished: boolean;

  constructor(course: Partial<CourseItem> = {}) {
    this.id = course.id || Number.parseInt(this.getRandomID());
    this.title = course.title || '';
    this.slug = course.slug || '';
    this.description = course.description || '';
    this.color = course.color || '';
  }

  public getRandomID(): string {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000).toString(16);
    };
    return S4() + S4();
  }
}
