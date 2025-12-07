import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type {
  BusinessRow,
  BusinessActiveRow,
  BusinessUserRow,
} from "@/types";

type Role = BusinessUserRow["role"] | "owner" | null;
type CurrentBusinessOk =
  | {
      business: BusinessRow;
      role: Exclude<Role, null>;
      set_at: string; // ISO string from timestamptz
    }
  | {
      business: null;
      role: null;
      set_at: string | null;
      /**
       * Helpful hint for the caller when business is null.
       * - "no-current": user hasn't selected/created a current business
       * - "no-access": filtered by RLS or deleted
       * - "inactive": business exists but isn't active (and caller isn't allowed to see it)
       * - "not-found": current points to a business that doesn't exist anymore
       */
      reason: "no-current" | "no-access" | "inactive" | "not-found";
    };

type CurrentBusinessErr = {
  error: string;
};

export async function GET(_request: Request) {
  const supabase = await createClient();

  try {
    // 1) Auth gate
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      return NextResponse.json<CurrentBusinessErr>(
        { error: userErr.message },
        { status: 500 }
      );
    }
    if (!user) {
      return NextResponse.json<CurrentBusinessErr>(
        { error: "unauthorized" },
        { status: 403 }
      );
    }

    // 2) Read current business pointer
    const { data: current, error: currentErr } = await supabase
      .from("business_current")
      .select("business_id, set_at")
      .eq("user_id", user.id)
      .maybeSingle<Pick<BusinessActiveRow, "business_id" | "set_at">>();

    if (currentErr) {
      return NextResponse.json<CurrentBusinessErr>(
        { error: currentErr.message },
        { status: 500 }
      );
    }

    if (!current) {
      return NextResponse.json<CurrentBusinessOk>(
        { business: null, role: null, set_at: null, reason: "no-current" },
        { status: 200 }
      );
    }
    
    const { data: business, error: bizErr } = await supabase
      .from("business")
      .select(
        [
          "id",
          "owner_id",
          "name",
          "description",
          "website_url",
          "instagram_url",
          "facebook_url",
          "image_url",
          "image_path",
          "is_active",
          "created_at",
          "updated_at",
        ].join(", ")
      )
      .eq("id", current.business_id)
      .maybeSingle<BusinessRow>();

    if (bizErr) {
      return NextResponse.json<CurrentBusinessErr>(
        { error: bizErr.message },
        { status: 500 }
      );
    }

    // If filtered by RLS or deleted
    if (!business) {
      return NextResponse.json<CurrentBusinessOk>(
        {
          business: null,
          role: null,
          set_at: current.set_at,
          reason: "no-access",
        },
        { status: 200 }
      );
    }

    // Optionally enforce active-only visibility for this endpoint
    if (!business.is_active) {
      return NextResponse.json<CurrentBusinessOk>(
        {
          business: null,
          role: null,
          set_at: current.set_at,
          reason: "inactive",
        },
        { status: 200 }
      );
    }

    // 4) Find membership role (may be null for owners who aren’t in business_user)
    const { data: membership, error: memErr } = await supabase
      .from("business_user")
      .select("role")
      .eq("business_id", business.id)
      .eq("user_id", user.id)
      .maybeSingle<Pick<BusinessUserRow, "role">>();

    if (memErr) {
      return NextResponse.json<CurrentBusinessErr>(
        { error: memErr.message },
        { status: 500 }
      );
    }

    const role: Exclude<Role, null> =
      membership?.role ?? (business.owner_id === user.id ? "owner" : "member");

    // 5) Success
    return NextResponse.json<CurrentBusinessOk>(
      {
        business,
        role,
        set_at: current.set_at,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json<CurrentBusinessErr>(
      { error: message },
      { status: 500 }
    );
  }
}
