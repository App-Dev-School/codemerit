import { RatingType } from "./rating-type"
import { SkillType } from "./skill-type"

export interface SkillRating {
    id: number
    userId: number
    //base fields
    skill_id: string
    skillType: SkillType
    
    rating: number
    //Self Rating: userId same as ratedBy
    //Quiz : Trivia
    ratedBy : number
    ratingType: RatingType
    createdAt : string
  }

  import { QuestionType } from "./question-type"
  
  export interface AssessmentSessionCreateDto {
      user_id: number
      ratedBy: number
      assessmentTitle: string
      skillRatings: SkillRating[]
      notes: string
      ratingType: RatingType
  }