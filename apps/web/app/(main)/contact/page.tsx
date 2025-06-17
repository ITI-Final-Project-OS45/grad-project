"use client";

import type React from "react";

import { motion, type Variants } from "framer-motion";
import {
  Mail,
  Send,
  MessageSquare,
  Clock,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Sparkles,
  Heart,
  Coffee,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
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

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Send us an email and we'll respond within 24 hours",
    value: "hello@teamflow.dev",
    action: "mailto:hello@teamflow.dev",
    gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Github,
    title: "GitHub",
    description: "Check out our code, report issues, or contribute",
    value: "github.com/teamflow",
    action: "https://github.com",
    gradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

const teamContacts = [
  {
    name: "Mohamed Hesham",
    role: "Project Lead & Full-Stack Developer",
    email: "mohamed@teamflow.dev",
    specialties: ["Architecture", "Next.js", "NestJS"],
  },
  {
    name: "Moamen Al-Ghareeb",
    role: "Full-Stack Developer",
    email: "moamen@teamflow.dev",
    specialties: ["Next.js", "NestJS", "MongoDB"],
  },
  {
    name: "Islam Tarek",
    role: "Full-Stack Developer",
    email: "islam@teamflow.dev",
    specialties: ["TypeScript", "MongoDB", "NestJS"],
  },
  {
    name: "Amr El-Sayed",
    role: "Full-Stack Developer",
    email: "amr@teamflow.dev",
    specialties: ["NestJS", "Cloudinary", "Next.js"],
  },
  {
    name: "Ahmed Abdelnasser",
    role: "Full-Stack Developer",
    email: "ahmed@teamflow.dev",
    specialties: ["NestJS", "Next.js", "MongoDB"],
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
                <MessageSquare className="h-8 w-8 text-primary" />
              </motion.div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1">
                <Heart className="h-4 w-4 mr-2" />
                Let's Connect
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Get in Touch with{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Team Flow
              </span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                className="inline-block ml-2"
              >
                👋
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              Have questions about Team Flow? Want to collaborate or provide feedback? We'd love to hear from you! Our
              team is here to help and always excited to connect.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Contact Methods */}
      <motion.section variants={sectionVariants} className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            How to Reach Us
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Choose your preferred way to connect with our team
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card
                className={`h-full bg-gradient-to-br ${method.gradient} border-border/50 hover:shadow-xl transition-all duration-300 cursor-pointer`}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 ${method.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <method.icon className={`h-8 w-8 ${method.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{method.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{method.description}</p>
                  <p className="font-medium text-foreground text-sm">{method.value}</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4">
                    <Button variant="outline" size="sm" className="border-border/50 hover:bg-accent/50">
                      Connect
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact Form & Team */}
      <motion.section variants={sectionVariants} className="bg-muted/30 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="bg-background/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Send className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Send us a Message</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          required
                          className="bg-background/50 border-border/50 hover:border-border focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          required
                          className="bg-background/50 border-border/50 hover:border-border focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What's this about?"
                        required
                        className="bg-background/50 border-border/50 hover:border-border focus:border-primary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        required
                        className="bg-background/50 border-border/50 hover:border-border focus:border-primary/50 resize-none"
                      />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                          className="ml-2"
                        >
                          ✨
                        </motion.div>
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Team Contacts */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-4">Meet the Team</h3>
                <p className="text-muted-foreground">
                  Want to reach out to a specific team member? Here's who does what.
                </p>
              </div>

              <div className="space-y-4">
                {teamContacts.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <Card className="bg-background/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{member.name}</h4>
                            <p className="text-sm text-primary font-medium">{member.role}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {member.specialties.map((specialty) => (
                              <Badge key={specialty} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8 grid grid-cols-2 gap-4"
              >
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100\">&lt; 24h</div>
                  <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Response Time</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <Coffee className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-900 dark:text-green-100">24/7</div>
                  <div className="text-xs text-green-600/70 dark:text-green-400/70">We're Here</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Social Links */}
      <motion.section variants={sectionVariants} className="container mx-auto px-6 py-16">
        <div className="text-center">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground mb-4"
          >
            Follow Our Journey
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mb-8"
          >
            Stay updated with our latest developments and behind-the-scenes content
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            {[
              { icon: Github, label: "GitHub", href: "#" },
              { icon: Twitter, label: "Twitter", href: "#" },
              { icon: Linkedin, label: "LinkedIn", href: "#" },
              { icon: Globe, label: "Blog", href: "#" },
            ].map((social, index) => (
              <motion.div key={social.label} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-border/50 hover:bg-accent/50 hover:border-primary/50 transition-all duration-200"
                >
                  <social.icon className="h-5 w-5 mr-2" />
                  {social.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>
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
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Don&apos;t wait! Join the Team Flow community and transform how your team collaborates.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg">
              <Link href="/signup">
                <Zap className="h-5 w-5 mr-2" />
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
