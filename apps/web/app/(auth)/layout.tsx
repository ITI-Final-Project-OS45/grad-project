"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { ThemeToggleDropdown } from "@/components/ui/theme-toggle-dropdown";
import Link from "next/link";
import { logoVariants, themeToggleVariants, mainVariants } from "@/constants/variants/auth.variants";
import { tokenManager } from "@/lib/token";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (tokenManager.isAuthenticated()) {
      router.push("/workspaces");
    }
  }, [router]);
  return (
    <motion.div
      variants={mainVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-background to-muted/20 overflow-hidden"
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0 opacity-30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-accent/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div variants={logoVariants} initial="hidden" animate="visible">
            <Link href="/">
              <Logo width={140} height={45} />
            </Link>
          </motion.div>
          <motion.div variants={themeToggleVariants} initial="hidden" animate="visible">
            <ThemeToggleDropdown />
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen p-6 pt-24">
        <motion.div
          className="w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            delay: 0.5,
          }}
        >
          {children}
        </motion.div>
      </main>
    </motion.div>
  );
}
