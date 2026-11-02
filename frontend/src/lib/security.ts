// Cognito account security operations (password, TOTP MFA) via Amplify.
import {
  fetchMFAPreference,
  setUpTOTP,
  updateMFAPreference,
  updatePassword,
  verifyTOTPSetup,
} from "aws-amplify/auth";

const APP_NAME = "LedgerOne";

// Amplify/Cognito errors carry a readable message; map the common ones to friendlier text.
export function describeAuthError(error: unknown, fallback: string) {
  const name = (error as { name?: string })?.name;
  const message = (error as { message?: string })?.message;

  switch (name) {
    case "NotAuthorizedException":
      return "Current password is incorrect.";
    case "InvalidPasswordException":
      return message ?? "New password does not meet the password policy.";
    case "LimitExceededException":
      return "Too many attempts. Please wait a moment and try again.";
    case "EnableSoftwareTokenMFAException":
    case "CodeMismatchException":
      return "The verification code is invalid. Check your authenticator app and try again.";
    case "InvalidParameterException":
      return message ?? fallback;
    case "UserUnAuthenticatedException":
      return "Your session has expired. Please sign in again.";
    default:
      return message || fallback;
  }
}

export function changePassword(oldPassword: string, newPassword: string) {
  return updatePassword({ oldPassword, newPassword });
}

export async function isTotpEnabled() {
  const preference = await fetchMFAPreference();
  return preference.enabled?.includes("TOTP") ?? false;
}

export async function startTotpSetup(accountName?: string) {
  const output = await setUpTOTP();
  return {
    secret: output.sharedSecret,
    setupUri: output.getSetupUri(APP_NAME, accountName).toString(),
  };
}

export async function confirmTotpSetup(code: string) {
  await verifyTOTPSetup({ code });
  await updateMFAPreference({ totp: "PREFERRED" });
}

export function disableTotp() {
  return updateMFAPreference({ totp: "DISABLED" });
}
