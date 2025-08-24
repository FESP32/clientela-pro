"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { QrCode, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReferralPassCard() {
  const referredBy = "Julia Fernández";
  const referralCode = "BAKERY-JULIA-25";
  const redeemed = false;
  const expiresAt = "2025-08-30";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center px-4">
      <Card className="max-w-sm w-full text-center bg-white shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">🎁 Referral Pass</CardTitle>
          <p className="text-sm text-muted-foreground">You were referred by:</p>
          <p className="font-medium text-green-700">{referredBy}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div
            className={cn(
              "rounded-xl border-2 p-4 text-center",
              redeemed
                ? "border-gray-300 bg-gray-100 text-gray-500"
                : "border-green-500 bg-green-100 text-green-800"
            )}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center"
            >
              <QrCode size={32} />
              <p className="text-sm mt-2 font-mono">{referralCode}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Show this code at checkout
              </p>
            </motion.div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Reward:{" "}
              <span className="text-green-800 font-semibold">25% off</span>
            </p>
            <p>Expires on: {expiresAt}</p>
          </div>

          {redeemed ? (
            <p className="text-xs text-gray-500 italic">Already redeemed</p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center gap-2 text-green-700 text-sm"
            >
              <Gift size={18} /> Ready to use!
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
