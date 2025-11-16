import { request } from "./http";
import type { Service } from "../types/services";
import type { ShopUserRoleSummary, ShopUserToggleResult } from "../types/shop";
import type { TeamOverview, WeekSchedule } from "../types/team";

export function getTeamOverview() {
  return request<TeamOverview>({ method: "GET", url: "/shop/team" });
}

export function toggleMemberStatus(memberId: number) {
  return request<ShopUserToggleResult>({ method: "PATCH", url: `/shop/team/${memberId}/status` });
}

export function toggleMemberBookable(memberId: number) {
  return request<ShopUserToggleResult>({ method: "PATCH", url: `/shop/team/${memberId}/bookable` });
}

export function updateMemberRole(memberId: number, role: ShopUserRoleSummary["role"]) {
  return request<ShopUserRoleSummary>({
    method: "PATCH",
    url: `/shop/team/${memberId}/role`,
    data: { role },
  });
}

export function getMemberServices(memberId: number) {
  return request<Service[]>({ method: "GET", url: `/shop/team/${memberId}/services` });
}

export function syncMemberServices(memberId: number, serviceIds: number[]) {
  return request<Service[]>({
    method: "PUT",
    url: `/shop/team/${memberId}/services`,
    data: { serviceIds },
  });
}

export function deleteMemberService(memberId: number, serviceId: number) {
  return request<{ removed: boolean }>({
    method: "DELETE",
    url: `/shop/team/${memberId}/services/${serviceId}`,
  });
}

export function getMemberHours(memberId: number) {
  return request<WeekSchedule[]>({ method: "GET", url: `/shop/team/${memberId}/hours` });
}

export function replaceMemberHours(memberId: number, week: WeekSchedule[]) {
  return request<WeekSchedule[]>({
    method: "PUT",
    url: `/shop/team/${memberId}/hours`,
    data: { week },
  });
}

export function patchMemberHours(memberId: number, week: WeekSchedule[]) {
  return request<WeekSchedule[]>({
    method: "PATCH",
    url: `/shop/team/${memberId}/hours`,
    data: { week },
  });
}

export function deleteMemberHours(memberId: number) {
  return request<{ deleted: number }>({ method: "DELETE", url: `/shop/team/${memberId}/hours` });
}
