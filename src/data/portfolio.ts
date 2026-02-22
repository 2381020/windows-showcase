export const portfolioData = {
  name: "John Doe",
  title: "Full Stack Developer",
  bio: "Passionate developer with 5+ years of experience building web applications. I love creating intuitive user experiences and solving complex problems with clean code.",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=portfolio",
  socialLinks: [
    { name: "GitHub", url: "https://github.com", icon: "github" },
    { name: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
    { name: "Twitter", url: "https://twitter.com", icon: "twitter" },
    { name: "Email", url: "mailto:john@example.com", icon: "mail" },
  ],
  projects: [
    {
      title: "E-Commerce Platform",
      description: "Full-stack e-commerce solution with payment integration, inventory management, and real-time order tracking.",
      tech: ["React", "Node.js", "PostgreSQL", "Stripe"],
      image: "🛒",
      url: "#",
    },
    {
      title: "Task Management App",
      description: "Collaborative task management tool with real-time updates, drag-and-drop boards, and team features.",
      tech: ["React", "TypeScript", "Firebase"],
      image: "📋",
      url: "#",
    },
    {
      title: "Weather Dashboard",
      description: "Beautiful weather dashboard with 7-day forecasts, interactive maps, and location-based alerts.",
      tech: ["React", "OpenWeather API", "Chart.js"],
      image: "🌤️",
      url: "#",
    },
    {
      title: "Portfolio Generator",
      description: "Drag-and-drop portfolio builder with customizable themes and one-click deployment.",
      tech: ["Next.js", "Tailwind CSS", "Vercel"],
      image: "🎨",
      url: "#",
    },
  ],
  experience: [
    {
      role: "Senior Frontend Developer",
      company: "Tech Corp",
      period: "2022 - Present",
      description: "Leading frontend development team, building scalable React applications.",
    },
    {
      role: "Full Stack Developer",
      company: "StartupXYZ",
      period: "2020 - 2022",
      description: "Built and maintained multiple web applications from scratch.",
    },
    {
      role: "Junior Developer",
      company: "WebAgency",
      period: "2018 - 2020",
      description: "Started career building responsive websites and web applications.",
    },
  ],
  education: [
    {
      degree: "B.S. Computer Science",
      school: "University of Technology",
      period: "2014 - 2018",
    },
  ],
  skills: [
    { name: "React", level: 95, category: "Frontend" },
    { name: "TypeScript", level: 90, category: "Frontend" },
    { name: "Tailwind CSS", level: 88, category: "Frontend" },
    { name: "Node.js", level: 82, category: "Backend" },
    { name: "PostgreSQL", level: 78, category: "Backend" },
    { name: "Python", level: 75, category: "Backend" },
    { name: "Docker", level: 70, category: "DevOps" },
    { name: "Git", level: 90, category: "Tools" },
    { name: "Figma", level: 72, category: "Design" },
  ],
};

export type AppId = "about" | "projects" | "resume" | "skills" | "contact";

export interface DesktopApp {
  id: AppId;
  name: string;
  icon: string;
}

export const desktopApps: DesktopApp[] = [
  { id: "about", name: "About Me", icon: "👤" },
  { id: "projects", name: "Projects", icon: "💼" },
  { id: "resume", name: "Resume", icon: "📄" },
  { id: "skills", name: "Skills", icon: "🛠️" },
  { id: "contact", name: "Contact", icon: "✉️" },
];
