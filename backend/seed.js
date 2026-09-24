const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('./models/Project');
const Profile = require('./models/Profile');
const Skill = require('./models/Skill');
const Experience = require('./models/Experience');
const Certification = require('./models/Certification');
const Education = require('./models/Education');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    // Mongoose 6+ doesn't need useNewUrlParser/useUnifiedTopology
}).then(async () => {
    console.log('MongoDB Connected for Seeding');

    // Seed Profile
    await Profile.deleteMany();
    await Profile.create({
        name: "Sivanesan S",
        role: "Full Stack Developer",
        aboutText: "I am a final-year Computer Science and Engineering student with a strong interest in Full Stack Web Development and emerging technologies. I enjoy building responsive, user-friendly, and visually engaging web applications using modern web technologies.\nMy goal is to continuously improve my technical skills while exploring Artificial Intelligence, Generative AI, and cloud technologies. I enjoy learning new concepts, building practical projects, and transforming ideas into useful digital experiences.",
        email: "example@email.com",
        location: "Madurai, India",
        linkedin: "linkedin.com/in/sivanesans",
        github: "github.com/sivanesans",
        resumeLink: "#"
    });

    // Seed Projects
    await Project.deleteMany();
    const projects = [
        {
            title: "Personal Portfolio Website",
            category: "Web Development",
            filterId: "web-development",
            description: "A modern responsive portfolio website showcasing my skills, projects, and professional journey.",
            technologies: ["HTML", "CSS", "JavaScript"],
            image: "assets/projects/portfolio.jpg",
            liveLink: "#",
            githubLink: "#"
        },
        {
            title: "My Coffee World",
            category: "Web Development",
            filterId: "web-development",
            description: "An interactive coffee information website with a modern and responsive interface.",
            technologies: ["HTML", "CSS", "JavaScript"],
            image: "assets/projects/coffee-world.png",
            liveLink: "#",
            githubLink: "#"
        },
        {
            title: "Jewellery E-Commerce Website",
            category: "Web Development",
            filterId: "web-development",
            description: "A modern responsive jewellery shopping website.",
            technologies: ["HTML", "CSS", "JavaScript"],
            image: "assets/projects/jewellery-ecommerce.png",
            liveLink: "#",
            githubLink: "#"
        },
        {
            title: "Wine Quality Grouping",
            category: "Machine Learning",
            filterId: "machine-learning",
            description: "A machine learning project focused on grouping and analyzing wine quality data.",
            technologies: ["Python", "Machine Learning", "Data Analysis"],
            image: "assets/projects/wine-quality.jpg",
            liveLink: "#",
            githubLink: "#"
        }
    ];
    await Project.insertMany(projects);

    // Seed Skills
    await Skill.deleteMany();
    const skills = [
        { category: "Frontend Development", name: "HTML5", percentage: 90 },
        { category: "Frontend Development", name: "CSS3", percentage: 85 },
        { category: "Frontend Development", name: "JavaScript", percentage: 80 },
        { category: "Frontend Development", name: "Responsive Design", percentage: 85 },
        { category: "Backend Development", name: "Node.js", percentage: 75 },
        { category: "Backend Development", name: "Express.js", percentage: 70 },
        { category: "Backend Development", name: "REST APIs", percentage: 70 },
        { category: "Database", name: "MongoDB", percentage: 75 },
        { category: "Database", name: "Database Fundamentals", percentage: 75 },
        { category: "Tools", name: "Git", percentage: 75 },
        { category: "Tools", name: "GitHub", percentage: 80 },
        { category: "Tools", name: "VS Code", percentage: 85 },
        { category: "Additional Skills", name: "Python", percentage: 70 },
        { category: "Additional Skills", name: "AI Fundamentals", percentage: 65 },
        { category: "Additional Skills", name: "Google Cloud Fundamentals", percentage: 60 }
    ];
    await Skill.insertMany(skills);

    // Seed Experience
    await Experience.deleteMany();
    const experiences = [
        {
            title: "Student Summer Internship (SSI 2026)",
            organization: "SSN College",
            date: "May 2026 – June 2026",
            mode: "Online",
            description: "Successfully completed the Student Summer Internship program and gained valuable exposure to technical learning and practical development."
        },
        {
            title: "Internship",
            organization: "Murugan Solutions",
            date: "2026",
            mode: "",
            description: "Completed a one-month internship and gained practical experience in web development and professional software development workflows."
        }
    ];
    await Experience.insertMany(experiences);

    // Seed Certifications
    await Certification.deleteMany();
    const certifications = [
        {
            title: "Google Cloud Generative AI",
            organization: "Google",
            date: "Expected 2026",
            icon: "fa-google",
            link: "#"
        },
        {
            title: "AWS EC2 and S3 Bootcamp",
            organization: "Amazon Web Services",
            date: "Expected 2026",
            icon: "fa-aws",
            link: "#"
        },
        {
            title: "Other Programming Certifications",
            organization: "Various Platforms",
            date: "In Progress",
            icon: "fa-certificate",
            link: "#"
        }
    ];
    await Certification.insertMany(certifications);

    // Seed Education
    await Education.deleteMany();
    const educations = [
        {
            degree: "Bachelor of Engineering",
            major: "Computer Science and Engineering",
            university: "Anna University Regional Campus Madurai",
            status: "Final Year Student",
            year: "Expected 2026",
            coursework: "Data Structures, Algorithms, Database Management Systems, Web Technology, Artificial Intelligence."
        }
    ];
    await Education.insertMany(educations);

    console.log('Database seeded successfully!');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
