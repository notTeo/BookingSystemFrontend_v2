import { request } from "./http";
import type { Invite } from "../types/shop";
import type { DeleteUserPayload, UpdateUserPayload, UserProfile } from "../types/user";

export function getCurrentUser() {
  return request<UserProfile>({ method: "GET", url: "/me" });
}

export function updateCurrentUser(payload: UpdateUserPayload) {
  return request<UserProfile>({ method: "PATCH", url: "/me", data: payload });
}

export function deleteCurrentUser(payload: DeleteUserPayload) {
  return request<null>({ method: "DELETE", url: "/me", data: payload });
}

export function listInvites() {
  return request<Invite[]>({ method: "GET", url: "/me/inbox" });
}

export function acceptInvite(inviteId: number) {
  return request<Invite>({ method: "PATCH", url: `/me/inbox/${inviteId}/accept` });
}

export function declineInvite(inviteId: number) {
  return request<Invite>({ method: "PATCH", url: `/me/inbox/${inviteId}/decline` });
}
