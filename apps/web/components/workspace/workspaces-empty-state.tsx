"use client";

import { Plus, Search, RefreshCw, Rocket, Sparkles, Users } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

interface WorkspacesEmptyStateProps {
  hasWorkspaces: boolean;
  searchQuery: string;
  onCreateWorkspace: () => void;
  onClearSearch?: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const iconVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 0.3,
    },
  },
};

const floatingVariants: Variants = {
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

export function WorkspacesEmptyState({
  hasWorkspaces,
  searchQuery,
  onCreateWorkspace,
  onClearSearch,
}: WorkspacesEmptyStateProps) {
  // Search results empty state
  if (searchQuery && hasWorkspaces) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center py-16">
        <motion.div variants={iconVariants} className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950/30 dark:to-red-950/30 rounded-full flex items-center justify-center mx-auto border border-orange-200/50 dark:border-orange-800/50">
            <Search className="h-12 w-12 text-orange-600 dark:text-orange-400" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
          >
            <span className="text-lg">🔍</span>
          </motion.div>
        </motion.div>

        <motion.h3 variants={itemVariants} className="text-2xl font-bold text-foreground mb-3">
          No workspaces found
        </motion.h3>
        <motion.p variants={itemVariants} className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
          We couldn't find any workspaces matching{" "}
          <span className="font-semibold text-foreground">&ldquo;{searchQuery}&rdquo;</span>. Try a different search
          term or create a new workspace.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          {onClearSearch && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={onClearSearch}
                className="flex items-center gap-2 border-border/50 hover:bg-accent/50"
              >
                <RefreshCw className="h-4 w-4" />
                Clear search
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onCreateWorkspace}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
                <Plus className="h-4 w-4" />
              </motion.div>
              Create new workspace
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // No workspaces exist at all
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center py-20">
      <motion.div variants={iconVariants} className="relative mb-8">
        <motion.div
          variants={floatingVariants}
          animate="float"
          className="w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto border border-primary/20 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <Rocket className="h-16 w-16 text-primary relative z-10" />
        </motion.div>

        {/* Floating decorations */}
        <motion.div
          className="absolute -top-4 -left-4 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center"
          animate={{
            y: [-5, 5, -5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </motion.div>

        <motion.div
          className="absolute -top-2 -right-6 w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center"
          animate={{
            y: [5, -5, 5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <Sparkles className="h-3 w-3 text-green-600 dark:text-green-400" />
        </motion.div>

        <motion.div
          className="absolute -bottom-2 -left-2 w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center"
          animate={{
            rotate: [0, -180, -360],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <span className="text-lg">✨</span>
        </motion.div>
      </motion.div>

      <motion.h3 variants={itemVariants} className="text-3xl font-bold text-foreground mb-4">
        Ready to build something amazing?
      </motion.h3>
      <motion.p variants={itemVariants} className="text-muted-foreground mb-8 text-lg max-w-lg mx-auto leading-relaxed">
        Your workspace journey starts here! Create your first workspace to organize projects, collaborate with your
        team, and turn your ideas into reality.
      </motion.p>

      <motion.div variants={itemVariants}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onCreateWorkspace}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }} className="mr-2">
              <Plus className="h-5 w-5" />
            </motion.div>
            Create your first workspace
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="ml-2"
            >
              🚀
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Collaborate</h4>
          <p className="text-sm text-muted-foreground">Work together with your team in real-time</p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Rocket className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Launch</h4>
          <p className="text-sm text-muted-foreground">Turn your ideas into successful projects</p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Innovate</h4>
          <p className="text-sm text-muted-foreground">Create something extraordinary together</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
