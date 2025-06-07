import { Button } from "@/components/ui/button";
import Link from "next/link";
import RotatingText from "@/components/ui/rotating-text";
import { ArrowRight, Play } from "lucide-react";
import { HERO_ROTATING_TEXTS, HERO_TEXT_CONFIG } from "@/constants/hero";

export const Hero = () => {
  return (
    <section className="bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground mb-8">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          Project Management Platform
        </div>

        {/* Main Heading with static text and gradient */}
        <div className="mb-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-foreground">Streamline Your </span>
            <div className="inline-block min-w-[200px] sm:min-w-[280px] lg:min-w-[320px]">
              <RotatingText
                texts={HERO_ROTATING_TEXTS}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                rotationInterval={HERO_TEXT_CONFIG.rotationInterval}
                staggerDuration={HERO_TEXT_CONFIG.staggerDuration}
                staggerFrom={HERO_TEXT_CONFIG.staggerFrom}
                mainClassName={HERO_TEXT_CONFIG.mainClassName}
                splitLevelClassName={HERO_TEXT_CONFIG.splitLevelClassName}
                elementLevelClassName={HERO_TEXT_CONFIG.elementLevelClassName}
              />
            </div>
          </h1>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-muted-foreground">
            That Flow <span className="text-rose-500">Naturally</span>
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          TeamFlow brings your team together with intuitive project management tools that adapt to your workflow.
          Collaborate effortlessly, track progress in real-time, and deliver projects on schedule with our comprehensive
          platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <Button size="lg">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Button variant="secondary" size="lg">
            <Play className="h-4 w-4" />
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
};
