import { Amplify } from "aws-amplify";
import {
  fetchAuthSession,
  signInWithRedirect,
  signIn,
  signOut,
} from "aws-amplify/auth";
import type { SignInOutput } from "aws-amplify/auth";

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!.replace(
  /^https?:\/\//,
  ""
);

const redirectSignIn = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN!;
const redirectSignOut = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNOUT!;

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      loginWith: {
        oauth: {
          domain,
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [redirectSignIn],
          redirectSignOut: [redirectSignOut],
          responseType: "code",
        },
      },
    },
  },
});

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const obj = JSON.parse(json);
    if (obj && typeof obj === "object") return obj as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

export async function isSignedIn(): Promise<boolean> {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    if (!idToken) return false;

    const payload = decodeJwtPayload(idToken);
    const exp = payload?.exp;

    if (typeof exp !== "number") return false;

    const nowSec = Math.floor(Date.now() / 1000);
    return exp > nowSec + 30;
  } catch {
    return false;
  }
}

export async function startHostedLogin(options?: { redirectTo?: string }) {
  const signedIn = await isSignedIn();

  if (signedIn) {
    window.location.href = options?.redirectTo ?? "/dashboard";
    return;
  }

  await signInWithRedirect();
}

export type PasswordLoginResult = {
  isSignedIn: boolean;
  nextStep: SignInOutput["nextStep"] | null;
  alreadySignedIn: boolean;
};

export async function loginWithPassword(
  email: string,
  password: string
): Promise<PasswordLoginResult> {
  const signedIn = await isSignedIn();

  if (signedIn) {
    return {
      isSignedIn: true,
      nextStep: null,
      alreadySignedIn: true,
    };
  }

  const res = await signIn({
    username: email,
    password,
  });

  return {
    isSignedIn: res.isSignedIn,
    nextStep: res.nextStep,
    alreadySignedIn: false,
  };
}

export async function logout() {
  try {
    await signOut();
  } catch (e) {
    console.warn("signOut error", e);
  }
  document.cookie = "erp_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
  window.location.href = "/login";
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() ?? null;
  } catch {
    return null;
  }
}

export async function waitForToken(maxMs = 4000): Promise<string | null> {
  const start = Date.now();

  while (Date.now() - start < maxMs) {
    const token = await getAccessToken();
    if (token) return token;

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return null;
}

export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}