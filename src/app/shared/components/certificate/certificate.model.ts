export interface CertificateModel {
  userName: string;
  skillName: string;
  tierDisplayName: string;
  assessmentTitle: string;
  scorePercentage: number;
  certificateNumber: string;
  templateId: string;
  issuedDate: Date;
  expiryDate: Date;
  verificationCode: string;
  platformName: string;
  issuerName: string;
  programLead: string;
}
