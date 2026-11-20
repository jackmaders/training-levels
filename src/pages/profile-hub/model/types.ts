export type ProfileVariant = "A" | "B" | "C";

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: "user" | "admin";
  createdAt: Date;
}

export interface DogLevelSummary {
  level: 1 | 2 | 3 | 4;
  title: string;
  completedSteps: number;
  totalSteps: number;
}

export interface ProfileDog {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  activeLevel: 1 | 2 | 3 | 4;
  completedSteps: number;
  totalSteps: number;
  levels: DogLevelSummary[];
}
