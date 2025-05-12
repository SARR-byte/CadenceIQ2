export type SequenceStage = 'First Email' | 'Second Email' | 'Phone/LinkedIn Connect' | 'Breakup Email';

export interface SocialProfile {
  companyInfo: {
    founded: string;
    milestones: string[];
    awards: string[];
    recentNews: string[];
    offerings: string[];
    culture: string[];
  } | null;
  personalInfo: {
    career: string[];
    education: string[];
    interests: string[];
    publications: string[];
    causes: string[];
    recentActivity: string[];
    achievements: string[];
  } | null;
  lastUpdated: Date | null;
}

export interface Contact {
  id: string;
  entityName: string;
  primaryContact: string;
  emailAddress: string;
  phoneNumber: string;
  companyLinkedIn: string;
  contactLinkedIn: string;
  contactFacebook: string;
  notes: string;
  stage: SequenceStage;
  day: WeekDay;
  completed: boolean;
  insights?: string;
  lastActivity?: Date;
  nextActivity?: Date;
  socialProfile: SocialProfile;
}

export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

interface UserSettings {
  leadGoal: number;
}

export interface CalendarEvent {
  id: string;
  contactId: string;
  entityName: string;
  stage: SequenceStage;
  date: Date;
  completed: boolean;
}