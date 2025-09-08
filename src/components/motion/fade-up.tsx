"use client";

import { motion, type Variants } from "framer-motion";

const parent: Variants = {
  hidden: {},
  show: { transition: { when: "beforeChildren", staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, scale: 0.975 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export function MotionSection(props: React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={parent}
      {...props}
    />
  );
}

export function MotionItem(props: React.ComponentProps<typeof motion.div>) {
  return <motion.div variants={item} {...props} />;
}
