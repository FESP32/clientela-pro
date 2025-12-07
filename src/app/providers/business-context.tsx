// app/providers/current-business-context.tsx
"use client";

import * as React from "react";

type Role = "owner" | "admin" | "member" | null;

export type CurrentBusiness =
  | {
      business: {
        id: string;
        owner_id: string;
        name: string;
        description: string | null;
        website_url: string | null;
        instagram_url: string | null;
        facebook_url: string | null;
        image_url: string | null;
        image_path: string | null;
        is_active: boolean;
        created_at: string; // ISO
        updated_at: string; // ISO
      };
      role: Exclude<Role, null>;
      set_at: string; // ISO
    }
  | {
      business: null;
      role: null;
      set_at: string | null;
      reason: "no-current" | "no-access" | "inactive" | "not-found";
    };

type State = {
  data: CurrentBusiness | null; // null while first load (if no initial)
  isLoading: boolean;
  error: string | null;
};

type Ctx = State & {
  refresh: () => Promise<void>;
  // Optional local setter if you want to optimistically change UI
  setLocal: (
    updater: (prev: CurrentBusiness | null) => CurrentBusiness | null
  ) => void;
};

const CurrentBusinessContext = React.createContext<Ctx | undefined>(undefined);

export function CurrentBusinessProvider({
  initial,
  children,
}: {
  /** Optional server-fetched payload to hydrate immediately */
  initial?: CurrentBusiness | null;
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<State>({
    data: initial ?? null,
    isLoading: !initial,
    error: null,
  });

  const refresh = React.useCallback(async () => {
    try {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      const res = await fetch("/api/business", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) ?? {};
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as CurrentBusiness;
      setState({ data: json, isLoading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, []);

  // If no initial is provided, fetch on mount
  React.useEffect(() => {
    if (!state.data && !initial) {
      void refresh();
    }
  }, [initial, refresh, state]);

  const setLocal = React.useCallback(
    (updater: (prev: CurrentBusiness | null) => CurrentBusiness | null) => {
      setState((s) => ({ ...s, data: updater(s.data) }));
    },
    []
  );

  const value: Ctx = { ...state, refresh, setLocal };

  return (
    <CurrentBusinessContext.Provider value={value}>
      {children}
    </CurrentBusinessContext.Provider>
  );
}

export function useCurrentBusiness() {
  const ctx = React.useContext(CurrentBusinessContext);
  if (!ctx) {
    throw new Error(
      "useCurrentBusiness must be used within <CurrentBusinessProvider>"
    );
  }
  return ctx;
}
