"use client";

import { motion, Variants } from "framer-motion";
import CountUp from "./count-up";
import { Card } from "@/components/ui/card";
import { STATISTICS_DATA } from "@/constants/statistics";

export const Statistics = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              Platform Statistics
            </span>
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Trusted by Teams Worldwide
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of teams who trust TeamFlow to deliver exceptional project outcomes
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16"
        >
          {STATISTICS_DATA.map((stat, index) => (
            <motion.div key={stat.id} variants={itemVariants}>
              <Card className={`p-8 text-center  border-0 h-full flex flex-col ${stat.bgColor}`}>
                <div className="flex justify-center mb-6">
                  <div className={`p-3 rounded-full bg-white dark:bg-card shadow-sm ${stat.iconColor}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-4xl md:text-5xl font-bold mb-3 text-foreground flex items-center justify-center">
                    <CountUp
                      to={stat.number}
                      duration={2.5}
                      delay={index * 0.2}
                      startWhen={true}
                      separator=","
                      className="text-4xl md:text-5xl font-bold"
                    />
                    <span className="text-2xl md:text-3xl text-primary">+</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{stat.label}</h3>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2 text-primary">
                  <CountUp to={99.9} duration={3} delay={0.5} className="text-4xl font-bold" />
                  <span className="text-2xl">%</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Uptime Guarantee</p>
                <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-12 bg-border"></div>
              </div>
              <div className="relative">
                <div className="text-4xl font-bold mb-2 text-primary">
                  <CountUp to={24} duration={3} delay={0.7} className="text-4xl font-bold" />
                  <span className="text-2xl">/7</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Support Available</p>
                <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-12 bg-border"></div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2 text-primary">
                  <CountUp to={50} duration={3} delay={0.9} className="text-4xl font-bold" />
                  <span className="text-2xl">%</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Faster Delivery</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
