export interface Subject {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  slug: string;
  image: string;
  color: string;
  isPublished: boolean;
  numQuestions: number;
  numusers: number;
  isSubscribed: boolean;
  coverage: number;
  score: number;
  subjects: Subject[];
}
export interface CourseDashboard {
  
}
