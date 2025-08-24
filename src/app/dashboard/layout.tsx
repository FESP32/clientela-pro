// app/(dashboard)/layout.tsx
import { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";
import {
  AppSidebar,
  type NavUserData,
} from "@/components/dashboard/common/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ClientBreadcrumbs from "@/components/dashboard/common/client-breadcrumbs";
import ThemeToggle from "@/components/dashboard/common/theme-toggle";
import LocaleSwitcher from "@/components/i18n/locale-switcher";
import { getActiveBusiness } from "@/actions/businesses";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userForNav: NavUserData = {
    name:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (user?.user_metadata as any)?.name ??
      user?.email?.split("@")[0] ??
      "Guest",
    email: user?.email ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    avatar: (user?.user_metadata as any)?.avatar_url ?? "/avatars/default.png",
  };

  const { business } = await getActiveBusiness();
  return (
    <SidebarProvider>
      <AppSidebar user={userForNav} activeBusiness={business} />
      <SidebarInset>
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <ClientBreadcrumbs />
          </div>
          <div className="pr-6 flex space-x-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
