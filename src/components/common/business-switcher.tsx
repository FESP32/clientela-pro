// components/dashboard/common/business-switcher.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronsUpDown, Plus, Store } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { BusinessRow } from "@/types/business";

type ActiveBusiness = Pick<BusinessRow, "id" | "name" | "image_url">;

export function BusinessSwitcher({
  activeBusiness,
}: {
  activeBusiness: ActiveBusiness | null;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden bg-sidebar-primary text-sidebar-primary-foreground">
                {activeBusiness && activeBusiness.image_url ? (
                  <Image
                    src={activeBusiness.image_url}
                    alt={activeBusiness.name}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeBusiness ? activeBusiness.name : "Create new business" }
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuItem asChild className="gap-2 p-2">
              <Link href="/dashboard/businesses/new">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Create new business
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="gap-2 p-2">
              <Link href="/dashboard/businesses">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Store className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  View all businesses
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
