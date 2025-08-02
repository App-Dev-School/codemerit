import { SkillType } from "./skill-type"

export interface SkillRating {
    id: number
    user_id: number
    skill_id: string
    skill_type: SkillType
    rating: number
    rated_by : number
    created_at : string
    //frontend specific
    skill_icon: string
  }