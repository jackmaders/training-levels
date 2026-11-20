import type { Permission } from "@/shared/auth/permissions";
import type { UserRole } from "@/shared/db/schema/auth";

export type AdminVariant = "A" | "B" | "C";

export type AdminRoleFilter = "all" | UserRole;

export type AdminTab = "users" | "dogs";

export const ADMIN_PERMISSIONS: readonly Permission[] = [
  "curriculum:read",
  "progress:update",
] as const;

export interface AdminDogSummary {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  currentLevel: string;
  completedStepsCount: number;
  practiceAttemptsCount: number;
  lastActiveAt: string;
  createdAt: string;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: string;
  permissions: Permission[];
  dogs: AdminDogSummary[];
}
