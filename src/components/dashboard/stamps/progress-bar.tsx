"use client";

import { motion } from "framer-motion";

export default  function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full rounded bg-muted">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="h-2 rounded bg-primary"
      />
    </div>
  );
}
