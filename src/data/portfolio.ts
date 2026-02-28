export const portfolioData = {
  name: "Andrew Jonathan Jordy Simbolon",
  "title": "IT Support & Junior Developer",
  "bio": "Mahasiswa Teknik Informatika berpengalaman dalam instalasi hardware, maintenance software, dan troubleshooting perangkat IT. Terbiasa mendukung operasional kampus melalui penanganan masalah teknologi serta memiliki minat dalam pengembangan web dan desain digital.",
  avatar: "https://avatars.githubusercontent.com/u/179359740?v=4",
  socialLinks: [
    { name: "GitHub", url: "https://github.com/2381020", icon: "github" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/andrew-simbolon-811923326/", icon: "linkedin" },
    { name: "Email", url: "mailto:andrew1simbolon@gmail.com", icon: "mail" },
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
  experience: 
  [
    {
      "role": "IT Support - Hardware & Software",
      "company": "Universitas Advent Indonesia",
      "period": "Mei 2025 - Sekarang",
      "description": [
        "Melakukan instalasi, perawatan, dan troubleshooting perangkat keras (PC, laptop, printer, jaringan internal).",
        "Mengelola instalasi dan pembaruan perangkat lunak untuk kebutuhan operasional fakultas dan administrasi.",
        "Mendukung dosen dan staf kampus dalam penggunaan perangkat teknologi serta memastikan kelancaran kegiatan akademik berbasis IT."
      ]
    },
  
    {
      "role": "Security (Satpam Kampus)",
      "company": "Universitas Advent Indonesia",
      "period": "April 2024 - Agustus 2024",
      "description": [
        "Melakukan pengawasan dan patroli rutin di area kampus untuk menjaga keamanan lingkungan akademik.",
        "Berkoordinasi dengan tim keamanan lain untuk memastikan keamanan kegiatan dan acara kampus."
      ]
    }
  ],
  education: [
    {
      degree: "Informatics Engineering",
      school: "Universitas Advent Indonesia",
      period: "2023 - 2027",
    },
  ],
  skills: [
    { name: "React", level: 70, category: "Frontend" },
    { name: "TypeScript", level: 70, category: "Frontend" },
    { name: "Tailwind CSS", level: 80, category: "Frontend" },
    { name: "Node.js", level: 70, category: "Backend" },
    { name: "MySQL", level: 75, category: "Backend" },
    { name: "Python", level: 75, category: "Backend" },
    { name: "Git", level: 60, category: "Tools" },
    { name: "Figma", level: 80, category: "Design" },
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
