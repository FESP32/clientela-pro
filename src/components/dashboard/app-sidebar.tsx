// components/dashboard/app-sidebar.tsx
"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Barcode,
  Settings2,
  SmilePlus,
  SquareTerminal,
  UserRoundCheck,
  Gift
} from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import { TeamSwitcher } from "@/components/dashboard/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export type NavUserData = {
  name: string;
  email: string;
  avatar: string; // URL
};

const data = {
  teams: [
    { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
    { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
    { name: "Evil Corp.", logo: Command, plan: "Free" },
  ],
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
    // {
    //   title: "Gifts",
    //   url: "#",
    //   icon: Gift,
    //   items: [
    //     { title: "Introduction", url: "#" },
    //   ],
    // },
    // {
    //   title: "Referrals",
    //   url: "#",
    //   icon: UserRoundCheck,
    //   items: [
    //     { title: "General", url: "#" },
    //   ],
    // },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: NavUserData }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
