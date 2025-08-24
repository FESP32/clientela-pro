// components/dashboard/app-sidebar.tsx
"use client";

import * as React from "react";
import { Barcode, SmilePlus, Stamp, Share2, Gift } from "lucide-react";
import { NavMain } from "@/components/dashboard/common/nav-main";
import { NavUser } from "@/components/dashboard/common/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { BusinessSwitcher } from "@/components/dashboard/common/business-switcher";
import type { BusinessRow } from "@/types/business"; // <-- Supabase-derived type

export type NavUserData = {
  name: string;
  email: string;
  avatar: string; // URL
};

const navData = {
  navMain: [
    {
      title: "Products",
      url: "#",
      icon: Barcode,
      items: [
        { title: "Product list", url: "/dashboard/products" },
        { title: "Create new product", url: "/dashboard/products/new" },
      ],
    },
    {
      title: "Surveys",
      url: "#",
      icon: SmilePlus,
      items: [
        { title: "Survey list", url: "/dashboard/surveys" },
        { title: "Create new survey", url: "/dashboard/surveys/new" },
      ],
    },
    {
      title: "Stamps",
      url: "#",
      icon: Stamp,
      items: [
        { title: "Create new stamp", url: "/dashboard/stamps/new" },
        { title: "Stamp List", url: "/dashboard/stamps" },
      ],
    },
    {
      title: "Referral",
      url: "#",
      icon: Share2,
      items: [
        { title: "Create new program", url: "/dashboard/referrals/new" },
        { title: "Program List", url: "/dashboard/referrals" },
      ],
    },
    {
      title: "Gifts",
      url: "#",
      icon: Gift,
      items: [
        { title: "Create new Gift", url: "/dashboard/gifts/new" },
        { title: "Gift List", url: "/dashboard/gifts" },
      ],
    },
  ],
};

// Use only the fields the switcher needs.
// If your table doesn’t have image_url, drop it from Pick<>.
type ActiveBusiness = Pick<BusinessRow, "id" | "name" | "image_url">;

export function AppSidebar({
  user,
  activeBusiness,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: NavUserData;
  activeBusiness: ActiveBusiness | null; // Supabase-typed
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BusinessSwitcher activeBusiness={activeBusiness} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
