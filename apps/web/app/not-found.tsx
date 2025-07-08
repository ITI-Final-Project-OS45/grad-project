"use client";

import { motion, Variants } from "framer-motion";
import { Home, ArrowLeft, Compass, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

const notFoundVariants: Variants = {
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const floatingVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const quickLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Features", href: "/features", icon: Compass },
  { name: "About", href: "/about", icon: MapPin },
  { name: "Contact", href: "/contact", icon: Clock },
];

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <motion.div
      variants={notFoundVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"
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
        className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-xl"
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

      <div className="max-w-4xl w-full text-center space-y-8">
        {/* 404 Number */}
        <motion.div variants={floatingVariants} className="relative">
          <motion.h1
            className="text-8xl md:text-9xl font-bold text-primary/20 select-none"
            animate={{
              rotateY: [0, 10, -10, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            404
          </motion.h1>

          {/* Floating icons around 404 */}
          <motion.div
            className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2"
            animate={{
              y: [0, -15, 0],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <Compass className="w-6 h-6 text-secondary/40" />
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <Card className="bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
          <CardContent className="p-8 space-y-6">
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Oops! Page Not Found</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                The page you're looking for seems to have vanished into the digital void. Don't worry, even the best
                explorers sometimes take a wrong turn!
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 border-border/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              </motion.div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants} className="pt-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Or explore these popular pages:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      asChild
                      className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent/50 border border-transparent hover:border-border/50"
                    >
                      <Link href={link.href}>
                        <link.icon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">{link.name}</span>
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Fun Message */}
            <motion.div variants={itemVariants} className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-block mr-2"
                >
                  🧭
                </motion.span>
                Lost? That's okay! Every great journey has a few detours. Let's get you back on track with TeamFlow.
              </p>
            </motion.div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <motion.div variants={itemVariants}>
          <p className="text-sm text-muted-foreground">
            Still can't find what you're looking for?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>{" "}
            and we'll help you out!
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
