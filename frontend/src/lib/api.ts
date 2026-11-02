import { getAccessToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type Query = Record<string, string | number | boolean | null | undefined>;

export type Paged<T> = {
  items: T[];
  nextCursor?: string | null;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function withQuery(path: string, query?: Query) {
  if (!query) return path;

  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === null || v === undefined) continue;
    const s = String(v);
    if (s.length === 0) continue;
    sp.set(k, s);
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

type ErrorBody = {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

// Backend returns { message } for business errors and ProblemDetails for model validation.
async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  if (!text) return res.statusText || `Request failed (${res.status})`;

  try {
    const body = JSON.parse(text) as ErrorBody;
    const validation = body.errors ? Object.values(body.errors).flat() : [];
    if (validation.length > 0) return validation.join(" ");
    return body.message ?? body.title ?? text;
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  query?: Query
): Promise<T> {
  const token = await getAccessToken();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${withQuery(path, query)}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Unable to reach the server. Please check your connection.");
  }

  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res));
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof ApiError) {
    if (error.status === 403) return error.message || "You do not have permission to perform this action.";
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
