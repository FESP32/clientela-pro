"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Stamp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_STAMPS = 12;

export default function LoyaltyCard() {
  const [earnedStamps, setEarnedStamps] = React.useState<number[]>([]);

  const toggleStamp = (index: number) => {
    setEarnedStamps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center px-4">
      <div className="bg-slate-50 max-w-screen rounded-2xl shadow-xl text-center px-4 py-2 my-6">
        <Card className="max-w-sm mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">🍞 Loyalty Card</CardTitle>
            <p className="text-sm text-muted-foreground">
              {earnedStamps.length}/{TOTAL_STAMPS} stamps collected
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Array.from({ length: TOTAL_STAMPS }).map((_, idx) => {
                const filled = earnedStamps.includes(idx);

                return (
                  <button
                    key={idx}
                    onClick={() => toggleStamp(idx)}
                    className={cn(
                      "w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-200",
                      filled
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-gray-300 bg-white text-gray-300"
                    )}
                  >
                    <AnimatePresence>
                      {filled && (
                        <motion.div
                          initial={{ scale: 0.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.3, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Stamp size={20} />
                        </motion.div>
                      )}
                      {!filled && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.5 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Stamp size={20} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
