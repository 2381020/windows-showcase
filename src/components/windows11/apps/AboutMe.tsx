import { portfolioData } from "@/data/portfolio";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  github: <Github className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  mail: <Mail className="h-5 w-5" />,
};

const AboutMe = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={portfolioData.avatar}
        alt="Profile"
        className="h-24 w-24 rounded-full bg-secondary"
      />
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">{portfolioData.name}</h2>
        <p className="text-sm text-primary font-medium">{portfolioData.title}</p>
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed">
        {portfolioData.bio}
      </p>
      <div className="flex gap-2 mt-2">
        {portfolioData.socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-foreground"
            title={link.name}
          >
            {iconMap[link.icon]}
          </a>
        ))}
      </div>
    </div>
  );
};

export default AboutMe;
