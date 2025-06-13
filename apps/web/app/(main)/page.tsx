"use client";
import { About } from "@/components/ui/about";
import { Hero } from "@/components/ui/hero";
import { Statistics } from "@/components/ui/statistics";
import { homeVariants } from "@/constants/variants/home.variants";
import { motion } from "framer-motion";
export default function Home() {
  return (
    <motion.main variants={homeVariants} initial="hidden" animate="visible" className="min-h-dvh">
      <Hero />
      <Statistics />
      <About />
    </motion.main>
  );
}
