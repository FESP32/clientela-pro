"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      icon?: LucideIcon;
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  // Exact match helper
  const isExact = (target: string) => pathname === target;
  // Parent open/active if any child is exact or a descendant
  const childOpenMatch = (target: string) =>
    isExact(target) || pathname.startsWith(`${target}/`);

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isOnParent = isExact(item.url);
          const childMatches =
            item.items?.some((s) => childOpenMatch(s.url)) ?? false;

          const defaultOpen = !isOnParent && childMatches;
          const parentActive = isOnParent || childMatches;

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={defaultOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "transition-colors",
                      parentActive
                        ? "bg-muted/60 text-foreground"
                        : "hover:bg-muted/50"
                    )}
                    aria-current={isOnParent ? "page" : undefined}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "h-4 w-4",
                          parentActive && "text-primary"
                        )}
                      />
                    )}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      // 🔑 Exact match ONLY for sub-items (prevents "List" from activating on "/new")
                      const subActive = isExact(subItem.url);
                      const SubIcon = subItem.icon;

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a
                              href={subItem.url}
                              aria-current={subActive ? "page" : undefined}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
                                subActive
                                  ? "bg-muted text-foreground"
                                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                              )}
                            >
                              {SubIcon && (
                                <SubIcon
                                  className={cn(
                                    "h-4 w-4",
                                    subActive && "text-primary"
                                  )}
                                />
                              )}
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
