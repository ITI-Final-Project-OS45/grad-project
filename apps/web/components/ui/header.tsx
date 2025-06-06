"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { ThemeToggleDropdown } from "./theme-toggle-dropdown";
import { Menu, X, TrendingUp, Zap } from "lucide-react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

const AnimatedHamburger = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  return (
    <motion.button
      onClick={onClick}
      className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-transparent transition-colors hover:bg-accent/50 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <X className="h-5 w-5 text-foreground" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -90 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Menu className="h-5 w-5 text-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      className={cn("fixed inset-x-0 top-0 z-50 w-full", className)}
      style={{
        boxShadow: visible ? "0 4px 20px -2px rgba(0, 0, 0, 0.1)" : "none",
      }}
      animate={{
        backgroundColor: visible ? "hsl(var(--background) / 0.95)" : "hsl(var(--background) / 0.8)",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 backdrop-blur-md" />
      <div className="relative">
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
            : child
        )}
        <ScrollProgress />
      </div>
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <div
      className={cn(
        "relative z-[60] mx-auto w-full max-w-7xl items-center justify-between px-6 py-4 hidden lg:flex transition-all duration-300",
        visible ? "bg-background/5" : "",
        className
      )}
    >
      {children}
    </div>
  );
};

const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const pathname = usePathname();

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn("flex flex-row items-center justify-center space-x-1 text-sm font-medium", className)}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
          },
        },
        hidden: {},
      }}
    >
      {items.map((item, idx) => {
        const isActive = pathname === item.link;
        return (
          <motion.div
            key={`link-${idx}`}
            className="relative"
            onMouseEnter={() => setHovered(idx)}
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                },
              },
            }}
            whileHover={{
              transition: { type: "spring", stiffness: 600, damping: 30 },
            }}
            whileTap={{ y: 0 }}
          >
            <Link
              href={item.link}
              onClick={onItemClick}
              className={cn(
                "relative px-6 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium no-underline flex items-center gap-2",
                "text-foreground/70 hover:text-foreground",
                isActive && "text-foreground font-semibold bg-accent"
              )}
            >
              <AnimatePresence>
                {hovered === idx && !isActive && (
                  <motion.div
                    layoutId="navbar-hover"
                    className="absolute inset-0 rounded-lg bg-accent/60"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 0.8,
                    }}
                  />
                )}
              </AnimatePresence>

              <span className="relative z-10 flex items-center justify-center gap-2">
                {item.icon && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                  >
                    {item.icon}
                  </motion.span>
                )}
                <span>{item.name}</span>
              </span>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <div
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between py-3 lg:hidden transition-all duration-300",
        visible ? "bg-background/5" : "",
        className
      )}
    >
      {children}
    </div>
  );
};

const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => {
  return <div className={cn("flex w-full flex-row items-center justify-between px-4", className)}>{children}</div>;
};

export const MobileNavMenu = ({ children, className, isOpen, onClose }: MobileNavMenuProps) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
            mass: 0.6,
          }}
          className={cn(
            "absolute inset-x-0 top-20 z-50 mx-4 flex w-[calc(100%-2rem)] flex-col items-start justify-start gap-6 rounded-2xl bg-background/95 p-6 backdrop-blur-xl border",
            "shadow-2xl",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NavbarLogo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Link href="/" className="relative z-20 flex items-center space-x-2 text-sm font-normal text-black rounded-lg">
        <Logo width={150} />
      </Link>
    </motion.div>
  );
};

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      name: "Features",
      link: "/features",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      name: "About",
      link: "/about",
    },
    {
      name: "Contact",
      link: "/contact",
    },
  ];

  return (
    <>
      <Navbar>
        <NavBody>
          <div className="flex items-center justify-between w-full">
            <NavbarLogo />

            <div className="flex-1 flex justify-center">
              <NavItems items={navItems} />
            </div>

            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
            >
              <ThemeToggleDropdown />
              <div className="hidden lg:flex items-center space-x-3">
                <Button asChild variant="secondary">
                  <Link href="/signin">Login</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/signup">Sign up for free</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <div className="flex items-center space-x-2">
              <ThemeToggleDropdown />
              <AnimatedHamburger isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            </div>
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            <nav className="w-full">
              <motion.ul
                className="space-y-2"
                initial="closed"
                animate="open"
                variants={{
                  open: {
                    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
                  },
                  closed: {
                    transition: { staggerChildren: 0.05, staggerDirection: -1 },
                  },
                }}
              >
                {navItems.map((item, index) => {
                  const isActive = pathname === item.link;
                  return (
                    <motion.li
                      key={item.link}
                      variants={{
                        open: {
                          y: 0,
                          opacity: 1,
                          transition: {
                            y: { stiffness: 1000, velocity: -100 },
                          },
                        },
                        closed: {
                          y: 20,
                          opacity: 0,
                          transition: {
                            y: { stiffness: 1000 },
                          },
                        },
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={item.link}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 text-base font-medium transition-all duration-200 rounded-xl",
                          "hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-primary/20",
                          isActive ? "text-foreground bg-accent" : "text-foreground/70 hover:text-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </nav>

            <motion.div
              className="flex flex-col space-y-3 pt-6 border-t border-border/50 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button variant="secondary" asChild className="w-full">
                <Link href="/signin">Login</Link>
              </Button>
              <Button asChild className="w-full bg-primary">
                <Link href="/signup">Sign up for free</Link>
              </Button>
            </motion.div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <div className="h-20 lg:h-24" />
    </>
  );
};
