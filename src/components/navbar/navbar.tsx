"use client"

import { Button } from "@/components/ui/button";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import Link from "next/link";

import ThemeToggle from "../dashboard/common/theme-toggle";
import LocaleSwitcher from "../i18n/locale-switcher";
import { Logo } from "./logo";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const t = useTranslations("Navigation");
    const isMobile = useIsMobile(); 
  return (
    <nav className="fixed z-10 top-6 inset-x-4 h-14 xs:h-16 bg-background/50 backdrop-blur-sm border dark:border-slate-700/70 max-w-screen-xl mx-auto rounded-full">
      <div className="h-full flex items-center justify-between mx-auto px-4">
        <div className="flex items-center space-x-1">
          <Logo size={32} hideText={isMobile}/>
        </div>

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button className="hidden xs:inline-flex">Get Started</Button>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
