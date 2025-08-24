import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";

const Hero = () => {
  const t = useTranslations("HomePage");

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center py-6 px-6">
      <div className="md:mt-2 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <h1 className="mt-2 max-w-[20ch] text-3xl xs:text-3xl sm:text-5xl md:text-6xl font-bold !leading-[1.2] tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-[60ch] xs:text-lg">{t("subtitle")}</p>
          <div className="mt-12 flex flex-col sm:flex-row items-center sm:justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full text-base"
            >
              <Link href={"/login"} className="flex items-center">
                {t('getStarted')} <ArrowUpRight className="!h-5 !w-5" />
              </Link>
            </Button>
            {/* <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full text-base shadow-none"
            >
              <CirclePlay className="!h-5 !w-5" /> Watch Demo
            </Button> */}
          </div>
        </div>
      </div>

      <Image
        src="/hero.svg"
        alt="Hero Banner"
        width={1200}
        height={500}
        className="mt-6 w-5/6 object-cover max-h-[500px]"
        priority
      />
    </div>
  );
};

export default Hero;
