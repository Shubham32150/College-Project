

export const teamMembers = {
    prayatna: {
        name: "Prayatna Sapkota",
        role: "Frontend Developer",
        skills: [
            { name: "HTML", level: 90 },
            { name: "CSS", level: 85 },
            { name: "JavaScript", level: 70 },
            { name: "Python", level: 40 },
            { name: "Linux", level: 65 }
        ],
        projects: [
            { name: "Terminal Portfolio", desc: "Interactive terminal portfolio with file system", tech: ["HTML", "CSS", "JS"], stars: 42 },
            { name: "Weather Dashboard", desc: "Real-time weather app with location detection", tech: ["JS", "API"], stars: 28 }
        ],
        city: "Banepa",
        country: "Nepal",
        fun: "Richard Feynman fanboy - watches physics lectures for fun",
        color: "#7ee787",
        github: "github.com/prayatnasapkota",
        email: "prayatna@gmail.com"
    },
    shubham: {
        name: "Shubham Pradhananga",
        role: "Frontend Developer & UI/UX",
        skills: [
            { name: "HTML/CSS", level: 80 },
            { name: "Python", level: 50 },
            { name: "Javascript", level: 50 },
            { name: "Linux", level: 25 }
        ],
        projects: [
            { name: "Personal Portfolio", desc: "Modern portfolio with dark mode and animations", tech: ["HTML", "CSS", "JS"], stars: 67 },
            { name: "E-Commerce Platform", desc: "Full-stack store with payment integration", tech: ["JS", "HTML", "CSS"], stars: 34 }
        ],
        city: "Banepa",
        country: "Nepal",
        fun: "Tech Enthusiast",
        color: "#79c0ff",
        github: "github.com/ShubsterTheDev",
        email: "shubhampradhananga@gmail.com"
    },
    dixit: {
        name: "Dixit Neupane",
        role: "Bug Hunter & QA Specialist",
        skills: [
            { name: "JavaScript", level: 75 },
            { name: "HTML/CSS", level: 80 },
            { name: "Testing", level: 85 },
            { name: "Debugging", level: 90 }
        ],
        projects: [
            { name: "Bug Tracker", desc: "Issue tracking system for developers", tech: ["JS", "Node.js"], stars: 29 },
            { name: "API Gateway", desc: "Microservices orchestration system", tech: ["Node.js", "Express"], stars: 45 }
        ],
        city: "Panauti",
        country: "Nepal",
        fun: "No plans for politics... yet 👀",
        color: "#d2a8ff",
        github: "github.com/dixitneupane",
        email: "dixit@gmail.com"
    }
};

export const fileSystem = {
    home: {
        prayatna: {
            "README.md": "# Prayatna's Home\n\nWelcome to my directory!\n\n- Check out my projects/ folder\n- View my skills\n- Contact me anytime",
            "skills.txt": "Frontend Skills:\n- HTML/CSS: Expert\n- JavaScript: Advanced\n- UI/UX Design: Intermediate",
            projects: {
                "terminal.md": "# Terminal Portfolio\n\nBuilt with vanilla JS. No frameworks!",
                "weather.md": "# Weather App\n\nReal-time forecasts using OpenWeather API"
            }
        },
        shubham: {
            "README.md": "# Shubham's Home\n\nBackend wizard at your service.",
            "server.js": "const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.json({ msg: 'Hello World' });\n});",
            projects: {
                "api.md": "# API Gateway\n\nMicroservices orchestration"
            }
        },
        dixit: {
            "README.md": "# Dixit's Home\n\nI find bugs so you don't have to.",
            "debug.log": "[2025-02-06] INFO: All systems operational\n[2025-02-06] DEBUG: No bugs found (yet)",
            projects: {
                "qa.md": "# QA Process\n\nTesting strategies and methodologies"
            }
        }
    },
    etc: {
        "motd": "Welcome to Archora Terminal! Type 'help' to get started.",
        "config.json": '{"theme": "cyberpunk", "animations": true}'
    }
};

export const asciiArt = {
    logo: `
     _    ____   ____ _   _  ___  ____      _    
    / \\  |  _ \\ / ___| | | |/ _ \\|  _ \\    / \\   
   / _ \\ | |_) | |   | |_| | | | | |_) |  / _ \\  
  / ___ \\|  _ <| |___|  _  | |_| |  _ <  / ___ \\ 
 /_/   \\_\\_| \\_\\\\____|_| |_|\\___/|_| \\_\\/_/   \\_\\
    `,
    tux: `
    .--.
   |o_o |
   |:_/ |
  //   \\ \\
 (|     | )
/'\\_   _/\`\\
\\___)=(___/
    `,
    cat: `
      /\\_/\\
     ( o.o )
      > ^ <
     /|   |\\
    (_|   |_)
    ~Catto~`
};

export const defaultPosts = [
    {
        id: 'post-1',
        author: 'team',
        title: 'New Feature: Interactive Terminal Portfolio',
        content: "We just merged our terminal project into the main portfolio! Now you can explore each team member's profile through an interactive terminal interface. 🖥️✨",
        code: "$ whoami\n> Archora\n$ ls skills/\n> frontend/ backend/ devops/ design/\n$ ./launch --awesome",
        tags: ["#TeamWork", "#JavaScript", "#Terminal", "#Innovation"],
        timestamp: Date.now() - 7200000 // 2h ago
    },
    {
        id: 'post-2',
        author: 'prayatna',
        title: 'Designing Dark Mode That Actually Works',
        content: "Here's our approach to implementing a seamless dark/light mode toggle:",
        code: ":root {\n  --bg: #f8f9fa;\n  --fg: #212529;\n}\n\n.dark-theme {\n  --bg: #0d1117;\n  --fg: #c9d1d9;\n}",
        tags: ["#CSS", "#DarkMode", "#UXDesign", "#WebDev"],
        timestamp: Date.now() - 86400000 // 1d ago
    },
    {
        id: 'post-3',
        author: 'shubham',
        title: 'School Project Showcase This Friday!',
        content: "Join us as we demonstrate the features of our new portfolio website. \n\n🕒 2:00 PM NPT | 📍 Computer Lab",
        tags: ["#SchoolProject", "#DemoDay", "#TeamWork"],
        timestamp: Date.now() - 259200000 // 3d ago
    }
];

export const defaultProjects = [
    {
        id: 'proj-1',
        title: 'Archora Portfolio',
        description: 'An interactive terminal-based portfolio with file system simulation, mini-games, and real commands. Built entirely with vanilla JavaScript.',
        tags: ['HTML', 'CSS', 'JavaScript'],
        image: 'https://via.placeholder.com/400x200/4cceac/ffffff?text=Portfolio',
        links: { demo: '#', github: '#' }
    },
    {
        id: 'proj-2',
        title: 'Tech News Aggregator',
        description: 'A modern tech news website that aggregates the latest technology news from around the world using News API.',
        tags: ['HTML', 'CSS', 'JavaScript', 'API'],
        image: 'https://via.placeholder.com/400x200/58a6ff/ffffff?text=Tech+News',
        links: { demo: '#', github: '#' }
    },
    {
        id: 'proj-3',
        title: 'Weather Forecast App',
        description: 'Real-time weather application with location detection and 5-day forecasts using OpenWeatherMap API.',
        tags: ['HTML', 'CSS', 'JavaScript', 'API'],
        image: 'https://via.placeholder.com/400x200/ec6cb9/ffffff?text=Weather+App',
        links: { demo: '#', github: '#' }
    },
    {
        id: 'proj-4',
        title: 'Scientific Calculator',
        description: 'A fully functional calculator with arithmetic operations, memory functions, and keyboard support.',
        tags: ['HTML', 'CSS', 'JavaScript'],
        image: 'https://via.placeholder.com/400x200/7ee787/0d1117?text=Calculator',
        links: { demo: '#', github: '#' }
    }
];
