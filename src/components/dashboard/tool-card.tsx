"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import Link from "next/link";

type ToolOverview = {
  features: string[];
  integrations: string[];
  support: string[];
};

type Tool = {
  title: string;
  name: string;
  description: string;
  icon: string;
  overview: ToolOverview;
};

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { title, name, description, icon, overview } = tool;

  return (
    <Card className="w-full max-w-2xl shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="text-2xl">{icon}</span>
          {title}
        </CardTitle>
        <p className="text-muted-foreground text-sm">{description}</p>
        <Button asChild>
          <Link href={"/dashboard/" + name}>Go</Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {overview.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="integrations">
            <div className="flex flex-wrap gap-2 mt-2">
              {overview.integrations.map((item, idx) => (
                <Badge key={idx} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="support">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {overview.support.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
