import {
  Blocks,
  Bot,
  Gift,
  HeartHandshake,
  ListChecks,
  Stamp,
} from "lucide-react";
import React from "react";

const features = [
  {
    icon: ListChecks,
    title: "Customer Surveys",
    description:
      "Collect quick feedback with customizable surveys that help you understand your customers better.",
  },
  {
    icon: Stamp,
    title: "Loyalty Stamp Cards",
    description:
      "Reward repeat customers with digital stamp cards they can carry anywhere.",
  },
  {
    icon: Gift,
    title: "Perks & Gifts",
    description:
      "Offer discounts, freebies, and special gifts to surprise and delight your loyal clients.",
  },
  {
    icon: HeartHandshake,
    title: "Referrals Made Easy",
    description:
      "Encourage customers to invite friends and reward both sides for growing your community.",
  },
  {
    icon: Blocks,
    title: "Simple to Use",
    description:
      "Launch programs in minutes with ready-made templates and an intuitive interface.",
  },
  {
    icon: Bot,
    title: "Automated Rewards",
    description:
      "Set it and forget it—rewards and perks are applied automatically as customers engage.",
  },
];

const Features = () => {
  return (
    <div id="features" className="w-full py-12 xs:py-20 px-6">
      <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold tracking-tight text-center">
        Everything you need to keep customers coming back
      </h2>
      <div className="w-full max-w-screen-lg mx-auto mt-10 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col bg-background border rounded-xl py-6 px-5"
          >
            <div className="mb-3 h-10 w-10 flex items-center justify-center bg-muted rounded-full">
              <feature.icon className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold">{feature.title}</span>
            <p className="mt-1 text-foreground/80 text-[15px]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
