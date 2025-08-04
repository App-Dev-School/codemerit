import { SkillRating } from "./skill-rating"

export interface Profile {
    user_id: number
    name: string
    addedSkills: boolean
    playedQuiz: boolean
    startedInterview: boolean
    level1Assessment: boolean
    level2Assessment: boolean
    self_skill_rating: SkillRating[]
    skill_rating: SkillRating[]
  }