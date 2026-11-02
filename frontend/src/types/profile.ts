export type UserProfile = {
  userId: string;
  fullName: string;
  jobTitle?: string | null;
  department?: string | null;
  emailAlerts: boolean;
  desktopNotifications: boolean;
  passwordChangedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserProfileRequest = {
  fullName: string;
  jobTitle?: string | null;
  department?: string | null;
  emailAlerts: boolean;
  desktopNotifications: boolean;
};
