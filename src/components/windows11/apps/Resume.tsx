import { portfolioData } from "@/data/portfolio";
import { Briefcase, GraduationCap } from "lucide-react";

const Resume = () => {
  return (
    <div className="space-y-6">
      {/* Experience */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Briefcase className="h-4 w-4 text-primary" /> Experience
        </h3>
        <div className="space-y-3 ml-2 border-l-2 border-primary/30 pl-4">
          {portfolioData.experience.map((exp, i) => (
            <div key={i}>
              <h4 className="text-sm font-medium text-foreground">{exp.role}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{exp.company}</span>
                <span>•</span>
                <span>{exp.period}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <GraduationCap className="h-4 w-4 text-primary" /> Education
        </h3>
        <div className="space-y-2 ml-2 border-l-2 border-primary/30 pl-4">
          {portfolioData.education.map((edu, i) => (
            <div key={i}>
              <h4 className="text-sm font-medium text-foreground">{edu.degree}</h4>
              <div className="text-xs text-muted-foreground">
                {edu.school} • {edu.period}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resume;
