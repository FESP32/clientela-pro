"use client";

import { motion } from "framer-motion";
import { Store } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BusinessMissingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      {/* Animated Store Icon */}
      <motion.div
        initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="p-6 rounded-full bg-primary/10"
      >
        <Store className="w-20 h-20 text-primary" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-2xl font-bold"
      >
        Create a New Business
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-muted-foreground"
      >
        Ready to get started? Click below to open the form.
      </motion.p>

      {/* Button Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Button asChild>
          <Link href="/dashboard/businesses/new">Go to Business Form</Link>
        </Button>
      </motion.div>
    </div>
  );
}
