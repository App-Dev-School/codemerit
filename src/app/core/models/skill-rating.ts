import { RatingType } from "./rating-type"
import { SkillType } from "./skill-type"

export interface SkillRating {
    id: number
    userId: number
    skill_id: string
    skillType: SkillType
    rating: number
    //Self Rating: userId same as ratedBy
    //Quiz : Trivia
    ratedBy : number
    ratingType: RatingType
    createdAt : string
    //frontend specific
    skill_icon: string
  }