import { RatingType } from "./rating-type"
import { SkillType } from "./skill-type"

export interface SkillRating {
  id?: number
  skillId: string
  skillType: SkillType
  rating: number | null;
  ratingType: RatingType

  knows?: boolean;
  level?: string;
  grade?: string;
  skillName?: string
  imageUrl?: string

  createdAt?: string
  updatedAt?: string
}

export interface SkillRatingSession {
  id?: number
  user_id: number        // User being rated
  ratedBy: number        // User giving the rating
  assessmentTitle: string
  skillRatings: SkillRating[]
  notes: string
  createdAt: string
  updatedAt?: string
}