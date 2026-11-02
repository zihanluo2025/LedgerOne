import { apiFetch } from "@/lib/api";
import type { UpdateUserProfileRequest, UserProfile } from "@/types/profile";

const BASE = "/api/profile";

export function getMyProfile() {
  return apiFetch<UserProfile>(`${BASE}/me`);
}

export function updateMyProfile(payload: UpdateUserProfileRequest) {
  return apiFetch<UserProfile>(`${BASE}/me`, { method: "PUT", body: JSON.stringify(payload) });
}

export function recordPasswordChanged() {
  return apiFetch<UserProfile>(`${BASE}/me/password-changed`, { method: "POST" });
}

export function listDepartments() {
  return apiFetch<string[]>(`${BASE}/departments`);
}
