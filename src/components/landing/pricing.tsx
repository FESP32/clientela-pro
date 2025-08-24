"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleHelp } from "lucide-react";

const tooltipContent = {
  surveys:
    "Create branded surveys with logic, custom fields, and export responses.",
  stamps:
    "Launch loyalty stamp cards. Set goals, track punches, and issue intents.",
  gifts:
    "Set up gift/reward campaigns customers can redeem. Track redemptions.",
  referrals:
    "Create referral programs with unique links, rewards, and anti-fraud checks.",
  seats: "Invite teammates to collaborate with roles & permissions.",
  api: "Use the API to automate creation, issuance, and retrieval.",
  limits:
    "Monthly limits reset each billing cycle. Fair use and anti-abuse policies apply.",
};

const YEARLY_DISCOUNT = 20;

type Plan = {
  name: string;
  price: number; // monthly base USD
  description: string;
  features: { title: string; tooltip?: string }[];
  buttonText: string;
  isPopular?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: 0,
    description:
      "Everything you need to try surveys, stamp cards, gifts, and referrals.",
    features: [
      { title: "Up to 3 surveys / mo", tooltip: tooltipContent.surveys },
      { title: "1 active stamp card", tooltip: tooltipContent.stamps },
      {
        title: "Basic gifts (50 redemptions / mo)",
        tooltip: tooltipContent.gifts,
      },
      {
        title: "Basic referrals (100 visits / mo)",
        tooltip: tooltipContent.referrals,
      },
      { title: "1 team seat", tooltip: tooltipContent.seats },
    ],
    buttonText: "Get started for free",
  },
  {
    name: "Growth",
    price: 20,
    isPopular: true,
    description:
      "Scale customer programs with higher limits and collaboration tools.",
    features: [
      { title: "Unlimited surveys", tooltip: tooltipContent.surveys },
      { title: "Up to 5 active stamp cards", tooltip: tooltipContent.stamps },
      { title: "Gifts: 2,500 redemptions / mo", tooltip: tooltipContent.gifts },
      {
        title: "Referrals: 10k visits / mo",
        tooltip: tooltipContent.referrals,
      },
      { title: "3 team seats", tooltip: tooltipContent.seats },
      { title: "API access", tooltip: tooltipContent.api },
    ],
    buttonText: "Choose Growth",
  },
  {
    name: "Pro",
    price: 40,
    description: "Advanced limits, priority support, and full API automation.",
    features: [
      { title: "Unlimited surveys", tooltip: tooltipContent.surveys },
      { title: "Unlimited active stamp cards", tooltip: tooltipContent.stamps },
      { title: "Gifts: 10k redemptions / mo", tooltip: tooltipContent.gifts },
      {
        title: "Referrals: 100k visits / mo",
        tooltip: tooltipContent.referrals,
      },
      { title: "10 team seats", tooltip: tooltipContent.seats },
      { title: "API access + webhooks", tooltip: tooltipContent.api },
      { title: "Fair use limits", tooltip: tooltipContent.limits },
    ],
    buttonText: "Upgrade to Pro",
  },
];

function monthlyPrice(price: number, period: "monthly" | "yearly") {
  if (price === 0) return 0;
  if (period === "monthly") return price;
  // show discounted monthly equivalent for yearly billing
  const discounted = Math.round(price * (1 - YEARLY_DISCOUNT / 100));
  return discounted;
}

const Pricing = () => {
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<
    "monthly" | "yearly"
  >("monthly");

  return (
    <div
      id="pricing"
      className="flex flex-col items-center justify-center py-12 xs:py-20 px-6"
    >
      <h1 className="text-3xl xs:text-4xl md:text-5xl font-bold text-center tracking-tight">
        Pricing
      </h1>

      <Tabs
        value={selectedBillingPeriod}
        onValueChange={(v) =>
          setSelectedBillingPeriod(v as "monthly" | "yearly")
        }
        className="mt-8"
      >
        <TabsList className="h-11 px-1.5 rounded-full bg-primary/5">
          <TabsTrigger value="monthly" className="py-1.5 rounded-full">
            Monthly
          </TabsTrigger>
          <TabsTrigger value="yearly" className="py-1.5 rounded-full">
            Yearly (Save {YEARLY_DISCOUNT}%)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-12 max-w-screen-lg mx-auto grid grid-cols-1 lg:grid-cols-3 items-stretch gap-8">
        {plans.map((plan) => {
          const price = monthlyPrice(plan.price, selectedBillingPeriod);

          return (
            <div
              key={plan.name}
              className={cn(
                "relative border rounded-xl p-6 bg-background/50 flex flex-col",
                {
                  "border-[2px] border-primary bg-background py-10":
                    plan.isPopular,
                }
              )}
            >
              {plan.isPopular && (
                <Badge className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                  Most Popular
                </Badge>
              )}

              <h3 className="text-lg font-medium">{plan.name}</h3>

              <p className="mt-2 text-4xl font-bold">
                {price === 0 ? (
                  "Free"
                ) : (
                  <>
                    ${price}
                    <span className="ml-1.5 text-sm text-muted-foreground font-normal">
                      /mo
                    </span>
                  </>
                )}
              </p>

              {selectedBillingPeriod === "yearly" && plan.price > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Billed annually. Base ${plan.price}/mo &rarr; ${price}/mo
                  after {YEARLY_DISCOUNT}% off.
                </p>
              )}

              <p className="mt-4 font-medium text-muted-foreground">
                {plan.description}
              </p>

              <Button
                variant={plan.isPopular ? "default" : "outline"}
                size="lg"
                className="w-full mt-6 text-base"
              >
                {plan.buttonText}
              </Button>

              <Separator className="my-8" />

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-1.5">
                    <CircleCheck className="h-4 w-4 mt-1 text-green-600" />
                    <span>{feature.title}</span>
                    {feature.tooltip && (
                      <Tooltip>
                        <TooltipTrigger className="cursor-help">
                          <CircleHelp className="h-4 w-4 mt-1 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>{feature.tooltip}</TooltipContent>
                      </Tooltip>
                    )}
                  </li>
                ))}
              </ul>

              {/* Spacer to keep buttons aligned if descriptions/feature lists differ */}
              <div className="grow" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;
