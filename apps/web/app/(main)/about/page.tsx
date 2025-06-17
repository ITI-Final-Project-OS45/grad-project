"use client";

import { motion, type Variants } from "framer-motion";
import {
  Target,
  Users,
  Lightbulb,
  Rocket,
  Shield,
  Zap,
  Heart,
  Star,
  Award,
  TrendingUp,
  Coffee,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

const teamMembers = [
  {
    name: "Mohamed Hesham",
    role: "Project Lead & Full-Stack Developer",
    initials: "MH",
    description: "Leading the Team Flow project while contributing to both frontend and backend development",
    skills: ["Leadership", "Next.js", "NestJS", "Framer Motion"],
    gradient: "from-blue-500 to-purple-500",
  },
  {
    name: "Moamen Al-Ghareeb",
    role: "Full-Stack Developer",
    initials: "MA",
    description: "Building scalable solutions across the entire tech stack with modern frameworks",
    skills: ["Next.js", "NestJS", "TypeScript", "MongoDB"],
    gradient: "from-green-500 to-teal-500",
  },
  {
    name: "Islam Tarek",
    role: "Full-Stack Developer",
    initials: "IT",
    description: "Developing end-to-end features from database to user interface",
    skills: ["Express", "NestJS", "Tailwind", "Security"],
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "Amr El-Sayed",
    role: "Full-Stack Developer",
    initials: "AE",
    description: "Creating seamless user experiences with robust backend architecture",
    skills: ["TypeScript", "MongoDB", "Next.js", "Cloudinary"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Ahmed Abdelnasser",
    role: "Full-Stack Developer",
    initials: "AA",
    description: "Building comprehensive solutions across frontend, backend, and deployment",
    skills: ["Full-Stack", "NestJS", "Next.js", "React"],
    gradient: "from-cyan-500 to-blue-500",
  },
];

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We're committed to solving real problems that teams face every day",
    gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
  },
  {
    icon: Users,
    title: "Team-First",
    description: "Collaboration and communication are at the heart of everything we build",
    gradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We embrace new technologies and creative solutions to complex challenges",
    gradient: "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
  },
  {
    icon: Shield,
    title: "Quality",
    description: "We maintain high standards in code quality, security, and user experience",
    gradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
  },
];

export default function AboutPage() {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b border-border/50"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
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
                <Heart className="h-8 w-8 text-primary" />
              </motion.div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1">
                <Star className="h-4 w-4 mr-2" />
                Our Story
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Building the Future of{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Team Collaboration
              </span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                className="inline-block ml-2"
              >
                💫
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              We're a passionate team of developers and designers on a mission to revolutionize how teams collaborate,
              plan, and execute projects. Team Flow was born from our own frustrations with fragmented tools and
              disconnected workflows.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Mission & Vision */}
      <motion.section variants={sectionVariants} className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              To create a modern, cross-functional centralized hub that empowers teams to plan, execute, and track every
              aspect of their projects seamlessly. We believe that great products come from great collaboration.
            </p>
            <div className="space-y-3">
              {[
                "Eliminate tool fragmentation",
                "Improve team communication",
                "Streamline project workflows",
                "Enhance productivity and quality",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/50"
              >
                <Rocket className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Innovation</h3>
                <p className="text-sm text-muted-foreground">Cutting-edge solutions for modern teams</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-xl border border-green-200/50 dark:border-green-800/50"
              >
                <Users className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Collaboration</h3>
                <p className="text-sm text-muted-foreground">Bringing teams together seamlessly</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-xl border border-purple-200/50 dark:border-purple-800/50"
              >
                <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Efficiency</h3>
                <p className="text-sm text-muted-foreground">Streamlined workflows that work</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-6 rounded-xl border border-orange-200/50 dark:border-orange-800/50"
              >
                <Award className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Quality</h3>
                <p className="text-sm text-muted-foreground">Excellence in every detail</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section variants={sectionVariants} className="bg-muted/30 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Meet Our Team
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              The passionate individuals behind Team Flow, each bringing unique expertise and creativity
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-background/50 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className={`bg-gradient-to-br ${member.gradient} text-white font-bold text-lg`}>
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                        <p className="text-sm text-primary font-medium">{member.role}</p>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{member.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Github className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section variants={sectionVariants} className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Our Values
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            The principles that guide our decisions and shape our culture
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card
                className={`h-full bg-gradient-to-br ${value.gradient} border-border/50 hover:shadow-lg transition-all duration-300`}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section variants={sectionVariants} className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "5", label: "Team Members", icon: Users },
              { number: "100%", label: "Passion", icon: Heart },
              { number: "24/7", label: "Dedication", icon: Coffee },
              { number: "∞", label: "Possibilities", icon: TrendingUp },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section variants={sectionVariants} className="container mx-auto px-6 py-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-foreground mb-4"
        >
          Join Our Journey
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          Be part of the future of team collaboration. Let's build something amazing together.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg">
              Get Started
              <Rocket className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="lg" className="border-border/50 hover:bg-accent/50">
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
