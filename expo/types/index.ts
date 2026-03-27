export interface Jar {
  id: string;
  startDate: string;
  unlockDate: string;
  durationMinutes: number;
  isUnlocked: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  jarId: string;
  text: string;
  createdAt: string;
}

export type DurationOption = 5 | 15 | 60 | 1440 | 10080 | 43200;
