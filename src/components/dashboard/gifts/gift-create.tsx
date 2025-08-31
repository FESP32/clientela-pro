"use client";

import { createGift } from "@/actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SubmitButton from "../common/submit-button";

// ✨ Icons + animation
import {
  Gift as GiftIcon,
  FileText,
  Image as ImageIcon,
  Info,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  action?: (fd: FormData) => Promise<void>;
  title?: string;
};

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const hoverPop = {
  whileHover: { scale: 1.02, translateY: -2 },
  whileTap: { scale: 0.98 },
};

export default function GiftCreate({
  action = createGift,
  title = "Create a gift",
}: Props) {
  return (
    <motion.div {...fadeIn}>
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <GiftIcon className="h-5 w-5" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {/* Friendly explainer */}
          <div className="mt-2">
            <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                A <span className="font-medium">gift</span> is a perk or reward
                your customers can claim. Give it a clear title, describe what
                it includes, and optionally add an image to make it stand out.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mini steps */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <motion.div
              className="rounded-lg border p-3 bg-background"
              {...hoverPop}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
            >
              <div className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4 text-primary" />
                Title
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Short and catchy, e.g. “Free Month”.
              </p>
            </motion.div>

            <motion.div
              className="rounded-lg border p-3 bg-background"
              {...hoverPop}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
            >
              <div className="flex items-center gap-2 font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Description
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                What’s included and any limits.
              </p>
            </motion.div>

            <motion.div
              className="rounded-lg border p-3 bg-background"
              {...hoverPop}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
            >
              <div className="flex items-center gap-2 font-medium">
                <ImageIcon className="h-4 w-4 text-primary" />
                Optional Image
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                A visual to grab attention.
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <form action={action} className="space-y-4">
            <motion.div
              {...fadeIn}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <Label htmlFor="title" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Free Month"
                required
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Keep it under 40 characters for best results.
              </p>
            </motion.div>

            <motion.div {...fadeIn} transition={{ duration: 0.25, delay: 0.1 }}>
              <Label htmlFor="description" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                Description (optional)
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the gift…"
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Mention eligibility or redemption details if needed.
              </p>
            </motion.div>

            <motion.div
              {...fadeIn}
              transition={{ duration: 0.25, delay: 0.15 }}
            >
              <Label htmlFor="image_url" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Image URL (optional)
              </Label>
              <Input
                id="image_url"
                name="image_url"
                placeholder="https://…"
                type="url"
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Use a public URL (JPG/PNG) around 800×600 for a crisp card.
              </p>
            </motion.div>

            <motion.div {...hoverPop} className="pt-2 flex">
              {/* Your SubmitButton already disables on pending via useFormStatus */}
              <SubmitButton />
            </motion.div>
          </form>
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Button asChild variant="ghost">
            <Link href="/dashboard/gifts">Back to gifts</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
