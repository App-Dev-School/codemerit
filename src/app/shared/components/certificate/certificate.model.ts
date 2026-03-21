export enum CertificateTemplateId {
  InternshipCompletion = 'Internship Completion',
  WorkExperience = 'Work Experience',
  Appreciation = 'Appreciation',
  MilestoneCompletion = 'Milestone Completion'
}

export interface CertificateModel {
  userId?: number;
  userName: string;
  skillName: string;
  tierDisplayName: string;
  assessmentTitle: string;
  scorePercentage: number;
  certificateNumber: string;
  issuerName: string;
  issuerLogo: string;
  sponsorName: string;
  sponsorLogo: string;
  issuedDate: Date;
  expiryDate: Date;
  verificationCode: string;
  templateId: CertificateTemplateId;
  platformName: string;
  signedBy: string;
  programLead: string;
}
