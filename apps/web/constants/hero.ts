// Hero section rotating text data
export const HERO_ROTATING_TEXTS = ["Projects", "Workflow", "Business", "Operations", "Success"];

// Hero text configuration
export const HERO_TEXT_CONFIG = {
  rotationInterval: 3000,
  staggerDuration: 0.025,
  staggerFrom: "last" as const,
  mainClassName:
    "px-1 sm:px-2 bg-primary text-white overflow-hidden py-0.5 sm:py-1 justify-center rounded-lg font-bold",
  splitLevelClassName: "overflow-hidden pb-0.5 sm:pb-1 md:pb-1",
  elementLevelClassName: "transform-gpu",
};
