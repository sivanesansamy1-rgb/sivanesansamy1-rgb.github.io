# Sivanesan S - Personal Portfolio

A modern, fully responsive personal portfolio website built to showcase my skills, projects, experience, and educational background. The application features a dynamic frontend interface and a Node.js/Express backend API for data management.

## Features

- **Modern UI/UX**: Dark/Light mode toggle, custom cursor, smooth scrolling, and scroll animations.
- **Responsive Design**: fully optimized for desktop, tablet, and mobile devices.
- **Dynamic Content**: Sections for About, Skills (with animated progress bars), Projects (with filtering and modals), Experience timeline, Education, and Certifications.
- **Backend Integration**: Node.js and Express.js REST API using MongoDB to manage portfolio data dynamically.
- **Contact Form**: Functional contact form UI.

## Tech Stack

**Frontend:**
- HTML5
- CSS3 (Vanilla CSS with CSS Variables for theming)
- JavaScript (Vanilla JS for DOM manipulation and animations)
- FontAwesome (Icons)
- Google Fonts (Outfit)

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- CORS & Dotenv

## Project Structure

```text
├── index.html          # Main entry point for the frontend
├── admin.html          # Admin dashboard frontend
├── css/                # CSS styles (style.css, etc.)
├── js/                 # Frontend JavaScript logic
├── assets/             # Images and other static assets
└── backend/            # Express.js API server
    ├── server.js       # Backend entry point
    ├── config/         # Database configuration
    ├── controllers/    # Route controllers
    ├── middleware/     # Custom middlewares (e.g., auth)
    ├── models/         # Mongoose schemas (Profile, Skill, Project, etc.)
    └── routes/         # API routes
```

## Setup Instructions

### 1. Frontend Setup
The frontend is built using standard web technologies. You can open `index.html` directly in your browser or serve it using any static file server like Live Server in VS Code.

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install the dependencies:
```bash
npm install
```

Create a `.env` file in the `backend` directory and configure the required environment variables. Example:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Run the backend server:
```bash
npm start
# or use nodemon for development
npm run dev
```

The API will start running at `http://localhost:5000`.

## License
This project is for personal portfolio use.
