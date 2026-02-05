import { RatingType } from "./rating-type"
import { SkillType } from "./skill-type"

export interface SkillRating {
  id: number
  skill_id: string
  skillType: SkillType
  rating: number
  ratingType: RatingType
  createdAt: string
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