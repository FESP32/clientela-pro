"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Gift, CheckCircle, XCircle } from "lucide-react";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface GiftDetails {
  customerName: string;
  rewardName: string;
  rewardCode: string;
  redeemed: boolean;
  expiresAt: string;
}

const mockGift: GiftDetails = {
  customerName: "Fernando Sánchez",
  rewardName: "Free Coffee & Croissant",
  rewardCode: "GIFT-2025-FERNANDO",
  redeemed: false,
  expiresAt: "2025-09-15",
};

export default function GiftRedemptionPage() {
  const { customerName, rewardName, rewardCode, redeemed, expiresAt } =
    mockGift;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-yellow-100 to-yellow-300 flex items-center justify-center px-4 py-8">
      <Card className="max-w-md w-full text-center bg-white shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            🎁 Redeem Your Gift
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Hi {customerName}, show this QR code at the counter
          </p>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="p-4 bg-yellow-50 rounded-lg border border-yellow-300"
          >
            <QrCode  size={160}  />
            <p className="text-xs text-muted-foreground mt-2">{rewardCode}</p>
          </motion.div>

          <div className="text-center text-sm">
            <p className="font-medium text-yellow-800">{rewardName}</p>
            <p className="text-muted-foreground text-xs mt-1">
              Expires on: {expiresAt}
            </p>
          </div>

          <div className="mt-2">
            {redeemed ? (
              <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
                <XCircle size={18} /> Already redeemed
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-700 text-sm">
                <CheckCircle size={18} /> Ready to redeem!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
