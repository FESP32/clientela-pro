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
      <NavigationMenuList className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
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
