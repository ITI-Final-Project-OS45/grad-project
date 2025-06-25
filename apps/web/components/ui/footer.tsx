"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Mail, MapPin, Clock, Users, Zap, Shield, Star, ChevronRight, Globe, Heart } from "lucide-react";

const footerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const navLinks = [
  {
    name: "About",
    href: "/about",
    icon: Users,
    description: "Learn about our mission",
  },
  {
    name: "Features",
    href: "/features",
    icon: Zap,
    description: "Explore powerful tools",
  },
  {
    name: "Contact",
    href: "/contact",
    icon: Mail,
    description: "Get in touch with us",
  },
  {
    name: "Workspaces",
    href: "/workspaces",
    icon: Globe,
    description: "Manage your projects",
  },
];

const stats = [
  { label: "Active Teams", value: "10K+", icon: Users },
  { label: "Projects Completed", value: "50K+", icon: Star },
  { label: "Uptime", value: "99.9%", icon: Shield },
];

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@teamflow.com",
    href: "mailto:hello@teamflow.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Alexandria, EGY",
    href: "#",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "24/7 Available",
    href: "/contact",
  },
];

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="relative bg-gradient-to-br from-background via-background to-muted/20 border-t border-border/50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={footerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative container mx-auto px-6 py-20 max-w-7xl"
      >
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand & CTA Section */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Logo width={180} />
                <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-primary">Live</span>
                </div>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Transform your team's productivity with intelligent project management that adapts to your workflow.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="text-center p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                size="lg"
                className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/signup" className="flex items-center">
                  <span>Start Your Journey</span>
                  <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Navigation</h3>
              </div>

              <div className="space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;

                  return (
                    <motion.div
                      key={link.name}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Link
                        href={link.href}
                        className={`
                          group flex items-center gap-4 p-4 rounded-xl transition-all duration-200
                          ${
                            isActive
                              ? "bg-primary/10 border border-primary/20 text-foreground"
                              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          }
                        `}
                      >
                        <div
                          className={`
                          w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                          ${isActive ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"}
                        `}
                        >
                          <link.icon
                            className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{link.name}</div>
                          <div className="text-sm text-muted-foreground">{link.description}</div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-all ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Get in Touch</h3>
              </div>

              <div className="space-y-4">
                {contactInfo.map((contact) => (
                  <motion.div key={contact.label} whileHover={{ scale: 1.02 }} className="group">
                    <Link
                      href={contact.href}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <contact.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{contact.value}</div>
                        <div className="text-xs text-muted-foreground">{contact.label}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Newsletter Signup */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/50">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Stay Updated</span>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full pr-12 pl-3 py-2.5 text-sm bg-background/80 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                    <Button size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Get weekly insights and product updates.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-border/50"
        >
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2025 TeamFlow</span>
            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
            <span className="flex items-center gap-1.5">
              Crafted with <Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" /> for amazing teams
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-600">All systems operational</span>
            </div>
            <div className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
