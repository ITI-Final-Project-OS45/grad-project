import CardSwap, { Card } from "./card-swap";
import { Users, Target, GitBranch, FileText } from "lucide-react";
import { Logo } from "./logo";

const cardData = [
  {
    icon: FileText,
    title: "PRD Management",
    description:
      "Create and version Project Requirements Documents with our markdown editor. Save versions with incremented numbers and export to PDF for stakeholder review.",
    tags: ["Markdown Editor", "Version Control"],
    gradient: "from-rose-600 via-rose-500 to-rose-400",
  },
  {
    icon: Target,
    title: "Design Phase",
    description:
      "Collaborate on design assets with Figma embedding, upload mockups and UI drafts. Version control for design iterations and seamless designer workflow.",
    tags: ["Figma Embed", "Asset Upload"],
    gradient: "from-gray-900 via-gray-800 to-black",
  },
  {
    icon: Users,
    title: "Development",
    description:
      "Assign tasks with priorities and due dates. Track status changes, get alerts for overdue items, and manage team workload with dashboard widgets.",
    tags: ["Task Assignment", "Due Date Alerts"],
    gradient: "from-rose-500 via-rose-600 to-rose-700",
  },
  {
    icon: GitBranch,
    title: "Release & Maintenance",
    description:
      "Plan releases with semantic versioning, track deployment status with QA approval. Manage hotfixes, bug reports, and post-deployment maintenance.",
    tags: ["Version Tags", "QA Workflow"],
    gradient: "from-black via-gray-800 to-gray-700",
  },
];

export const About = () => {
  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 lg:mb-6 flex items-center gap-2">
                <span>Why Choose</span>
                <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                  <Logo width={120} className="w-[120px] sm:w-[180px] lg:w-[220px] h-auto" />
                </span>
                <span>?</span>
              </h2>
              <p className="text-base lg:text-lg text-foreground leading-relaxed">
                TeamFlow streamlines your entire project lifecycle from requirements gathering to deployment. Manage
                PRDs, design collaboration, development tasks, and release workflows all in one platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">PRD Documentation</h3>
                  <p className="text-sm text-foreground">
                    Markdown editor with versioning and PDF export for project requirements
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Design Collaboration</h3>
                  <p className="text-sm text-foreground">
                    Figma embedding, mockup uploads, and design asset versioning
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Development</h3>
                  <p className="text-sm text-foreground">
                    Task assignment, priority tracking, and due date alerts with dashboard widgets
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Release & QA</h3>
                  <p className="text-sm text-foreground">
                    Semantic versioning, QA approval workflows, and hotfix management
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - CardSwap - Hidden on mobile and tablet */}
          <div className="relative hidden xl:flex items-center justify-center order-1 lg:order-2 min-h-[600px]">
            <CardSwap
              width={380}
              height={480}
              cardDistance={45}
              verticalDistance={55}
              delay={4500}
              pauseOnHover={true}
              easing="elastic"
            >
              {cardData.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <Card
                    key={index}
                    customClass={`bg-gradient-to-br ${card.gradient} border-0 text-white p-6 shadow-2xl backdrop-blur-sm`}
                  >
                    <div className="h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-white shrink-0" />
                        </div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse shrink-0"></div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                        {card.title}
                      </h3>
                      <p className="text-white/90 text-sm leading-relaxed flex-1">{card.description}</p>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {card.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
};
