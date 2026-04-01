"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

export type CurrentUser = {
  email?: string;
  name?: string;
  preferred_username?: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const session = await fetchAuthSession();
        const claims = session.tokens?.idToken?.payload as
          | {
              email?: string;
              name?: string;
              preferred_username?: string;
            }
          | undefined;

        if (!mounted) return;

        setUser({
          email: claims?.email,
          name: claims?.name,
          preferred_username: claims?.preferred_username,
        });
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const displayName = useMemo(() => {
    return user?.preferred_username || user?.name || user?.email || "User";
  }, [user]);

  return {
    user,
    loading,
    displayName,
  };
}