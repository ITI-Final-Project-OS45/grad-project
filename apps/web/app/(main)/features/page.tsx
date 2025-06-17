"use client";

import { motion, type Variants } from "framer-motion";
import {
  Users,
  Shield,
  FileText,
  CheckSquare,
  Palette,
  Rocket,
  Bug,
  GitBranch,
  Zap,
  Lock,
  Settings,
  TrendingUp,
  Clock,
  Eye,
  Download,
  Upload,
  MessageSquare,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const features = [
  {
    icon: Shield,
    title: "Authentication & Authorization",
    description: "Secure role-based access with JWT tokens and comprehensive permission matrix",
    details: ["Email/Username login", "Role-based permissions", "JWT token management", "Secure registration workflow"],
    gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200/50 dark:border-blue-800/50",
  },
  {
    icon: Users,
    title: "Project Workspaces",
    description: "Centralized hubs for cross-functional teams to collaborate and manage projects",
    details: ["Create & manage workspaces", "Team member invitations", "Role assignments", "Workspace permissions"],
    gradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
    iconBg: "bg-green-100 dark:bg-green-900/50",
    iconColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200/50 dark:border-green-800/50",
  },
  {
    icon: FileText,
    title: "PRD Management",
    description: "Markdown-based Project Requirements Documents with versioning and PDF export",
    details: ["Markdown editor", "Version control", "PDF export", "Collaborative editing"],
    gradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200/50 dark:border-purple-800/50",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description: "Comprehensive task tracking with due dates, priorities, and status management",
    details: ["Task assignment", "Due date alerts", "Priority levels", "Status tracking"],
    gradient: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    iconColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200/50 dark:border-orange-800/50",
  },
  {
    icon: Palette,
    title: "Design Collaboration",
    description: "Seamless design workflow with Figma embedding and mockup management",
    details: ["Figma integration", "Mockup uploads", "Design versioning", "Asset management"],
    gradient: "from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/50",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "border-cyan-200/50 dark:border-cyan-800/50",
  },
  {
    icon: Rocket,
    title: "Release Management",
    description: "Track releases, manage versions, and coordinate deployment workflows",
    details: ["Version tagging", "Release planning", "Deployment tracking", "QA integration"],
    gradient: "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    iconColor: "text-violet-600 dark:text-violet-400",
    borderColor: "border-violet-200/50 dark:border-violet-800/50",
  },
];

const roles = [
  {
    name: "Manager",
    description: "Full access to all workspace features and team management",
    permissions: ["Create workspaces", "Manage team members", "Full CRUD access", "Release management"],
    icon: Settings,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    name: "Developer",
    description: "Focus on task execution and code development",
    permissions: ["Update tasks status", "View project docs", "Access task board"],
    icon: GitBranch,
    color: "text-green-600 dark:text-green-400",
  },
  {
    name: "Designer",
    description: "Design asset management and creative collaboration",
    permissions: ["Upload mockups", "Embed Figma", "Asset management"],
    icon: Palette,
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    name: "QA",
    description: "Quality assurance and bug tracking specialist",
    permissions: ["Submit bug reports", "Update bug status", "QA verification Release", "Hotfix management"],
    icon: Bug,
    color: "text-orange-600 dark:text-orange-400",
  },
];

export default function FeaturesPage() {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b border-border/50"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div className="container mx-auto px-6 py-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <motion.div
                className="p-3 rounded-xl bg-primary/10 border border-primary/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Zap className="h-8 w-8 text-primary" />
              </motion.div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Powerful Features
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Everything You Need for{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Project Success
              </span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                className="inline-block ml-2"
              >
                🚀
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              Team Flow brings together all the tools your team needs to plan, execute, and deliver exceptional
              projects. From requirements to release, we've got you covered.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  <Link href="/signup" className="flex items-center">
                    Get Started Free
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      className="ml-2"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="lg" className="border-border/50 hover:bg-accent/50">
                  <Eye className="h-4 w-4 mr-2" />
                  View Demo
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.section variants={sectionVariants} className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Core Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Comprehensive tools designed for modern cross-functional teams
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Card
                className={`h-full bg-gradient-to-br ${feature.gradient} border ${feature.borderColor} hover:shadow-xl transition-all duration-300`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`p-3 rounded-xl ${feature.iconBg} group-hover:scale-110 transition-transform duration-200`}
                    >
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  </div>

                  <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>

                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-muted/30 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Role-Based Access Control
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Tailored permissions for every team member's responsibilities
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <motion.div
                key={role.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-background/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <role.icon className={`h-5 w-5 ${role.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{role.description}</p>

                    <div className="space-y-2">
                      {role.permissions.map((permission, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1 h-1 rounded-full bg-primary/60" />
                          {permission}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Tech Stack */}
      <motion.section variants={sectionVariants} className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Built with Modern Technology
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Cutting-edge tech stack for performance, scalability, and developer experience
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[
            { name: "Next.js", desc: "React Framework" },
            { name: "NestJS", desc: "Node.js Framework" },
            { name: "TypeScript", desc: "Type Safety" },
            { name: "MongoDB", desc: "Database" },
            { name: "Tailwind", desc: "CSS Framework" },
            { name: "Turborepo", desc: "Monorepo" },
          ].map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors duration-200"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground text-sm">{tech.name}</h4>
              <p className="text-xs text-muted-foreground">{tech.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section variants={sectionVariants} className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Ready to Transform Your Workflow?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Join teams already using Team Flow to deliver better projects faster
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Link href="/signup" className="flex items-center">
                Start Your Free Trial
                <Sparkles className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
