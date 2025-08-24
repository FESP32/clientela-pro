import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { NavigationMenuProps } from "@radix-ui/react-navigation-menu";
import { useTranslations } from "next-intl";
import Link from "next/link";

export const NavMenu = (props: NavigationMenuProps) => {
  const t = useTranslations("Navigation");
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-6 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="#features">{t("features")}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="#pricing">{t("pricing")}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="#faq">{t("FAQ")}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          {/* <NavigationMenuLink asChild>
            <Link href="#testimonials">{t("testimonials")}</Link>
          </NavigationMenuLink> */}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
