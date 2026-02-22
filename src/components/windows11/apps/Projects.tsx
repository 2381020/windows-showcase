import { portfolioData } from "@/data/portfolio";
import { ExternalLink } from "lucide-react";

const Projects = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {portfolioData.projects.map((project, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
        >
          <div className="text-3xl mb-2">{project.image}</div>
          <h3 className="font-semibold text-foreground text-sm mb-1">{project.title}</h3>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tech.map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
              >
                {t}
              </span>
            ))}
          </div>
          <a
            href={project.url}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            View Project <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ))}
    </div>
  );
};

export default Projects;
