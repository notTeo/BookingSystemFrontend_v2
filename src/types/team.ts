import type { DayOfWeek, ShopRole } from "./common";

export interface TeamMemberSummary {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  role: ShopRole;
  active: boolean;
  bookable: boolean;
  joinedAt: string;
  shopUserId: number;
}

export interface TeamOverview {
  shop: { id: number; name: string; ownerId: number };
  totalMembers: number;
  activeMembers: number;
  members: TeamMemberSummary[];
}

export interface StaffSlot {
  start: string; // HH:MM
  end: string; // HH:MM
}

export interface WeekSchedule {
  dayOfWeek: DayOfWeek;
  isOff: boolean;
  slots: StaffSlot[];
}