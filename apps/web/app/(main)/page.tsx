"use client";
import { About } from "@/components/ui/about";
import { Hero } from "@/components/ui/hero";
import { Statistics } from "@/components/ui/statistics";
import { motion } from "framer-motion";
export default function Home() {
  const mainVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.3,
      },
    },
  };

  return (
    <motion.main variants={mainVariants} initial="hidden" animate="visible" className="min-h-dvh">
      <Hero />
      <Statistics />
      <About />
    </motion.main>
  );
}
