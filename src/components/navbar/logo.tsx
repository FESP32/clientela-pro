"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  hideText?: boolean;
  size?: number;
}

export const Logo = ({ hideText = false, size = 32 }: LogoProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a skeleton if you prefer
  }

  const logoSrc =
    resolvedTheme === "dark" ? "/logo_dark.svg" : "/logo_lite.svg";

  return (
    <div className="flex items-center space-x-1">
      <Image
        src={logoSrc}
        alt="Hero Banner"
        width={size}
        height={size}
        className="object-cover"
        priority
      />
      {!hideText && (
        <span className="text-2xl font-extrabold text-primary dark:text-white">
          lientela Pro
        </span>
      )}
    </div>
  );
};
