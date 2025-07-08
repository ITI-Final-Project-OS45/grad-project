"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const errorVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <motion.div
      variants={errorVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-destructive/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <Card className="max-w-2xl w-full relative bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          <motion.div variants={itemVariants}>
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">Something went wrong!</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We encountered an unexpected error. Our team has been notified and is working to fix this issue.
            </p>
          </motion.div>

          {/* Error details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <motion.div variants={itemVariants}>
              <details className="text-left bg-muted/50 rounded-lg p-4 border border-border/50">
                <summary className="cursor-pointer font-medium text-foreground mb-2 flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Error Details (Development)
                </summary>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                </pre>
              </details>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={reset}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                Try Again
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" asChild className="flex items-center gap-2 border-border/50">
                <Link href="/">
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <p className="text-sm text-muted-foreground">
              If this problem persists, please{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact our support team
              </Link>
              .
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
