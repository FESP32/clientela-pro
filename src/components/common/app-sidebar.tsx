"use client";

import * as React from "react";
import {
  Stamp,
  Gift,
  List,
  Plus,
  Megaphone,
  ClipboardList,
  Package2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { NavMain } from "@/components/common/nav-main";
import { NavUser } from "@/components/common/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar, // ⬅️ import the hook
} from "@/components/ui/sidebar";
import { BusinessSwitcher } from "@/components/common/business-switcher";
import type { BusinessRow } from "@/types/business";

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
      icon: Package2,
      items: [
        { title: "List", url: "/dashboard/products", icon: List },
        { title: "New", url: "/dashboard/products/new", icon: Plus },
      ],
    },
    {
      title: "Surveys",
      url: "#",
      icon: ClipboardList,
      items: [
        { title: "List", url: "/dashboard/surveys", icon: List },
        { title: "New", url: "/dashboard/surveys/new", icon: Plus },
      ],
    },
    {
      title: "Stamps",
      url: "#",
      icon: Stamp,
      items: [
        { title: "List", url: "/dashboard/stamps", icon: List },
        { title: "New", url: "/dashboard/stamps/new", icon: Plus },
      ],
    },
    {
      title: "Referrals",
      url: "#",
      icon: Megaphone,
      items: [
        { title: "List", url: "/dashboard/referrals", icon: List },
        { title: "New", url: "/dashboard/referrals/new", icon: Plus },
      ],
    },
    {
      title: "Gifts",
      url: "#",
      icon: Gift,
      items: [
        { title: "List", url: "/dashboard/gifts", icon: List },
        { title: "New", url: "/dashboard/gifts/new", icon: Plus },
      ],
    },
  ],
};

type ActiveBusiness = Pick<BusinessRow, "id" | "name" | "image_url">;

export function AppSidebar({
  user,
  activeBusiness,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: NavUserData;
  activeBusiness: ActiveBusiness | null;
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  React.useEffect(() => {
    setOpenMobile?.(false);
  }, [pathname, setOpenMobile]);

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
