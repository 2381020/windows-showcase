import { portfolioData } from "@/data/portfolio";
import { Progress } from "@/components/ui/progress";

const Skills = () => {
  const categories = [...new Set(portfolioData.skills.map((s) => s.category))];

  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-foreground mb-2">{cat}</h3>
          <div className="space-y-2.5">
            {portfolioData.skills
              .filter((s) => s.category === cat)
              .map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skills;
