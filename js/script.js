document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       1. Theme Management (Dark/Light Mode)
    ========================================= */
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        // Default to system theme
        const defaultTheme = systemPrefersDark ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', defaultTheme);
        localStorage.setItem('portfolio-theme', defaultTheme);
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('portfolio-theme-overridden')) {
            const newTheme = e.matches ? 'dark' : 'light';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
        }
    });

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
        localStorage.setItem('portfolio-theme-overridden', 'true');
    });

    /* =========================================
       2. Custom Cursor
    ========================================= */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    // Check if it's a touch device
    const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

    if (!isTouchDevice && cursorDot && cursorOutline) {
        document.body.classList.add('cursor-none');

        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Move dot instantly
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Move outline with a slight delay using requestAnimationFrame for smoothness
            // We use simple CSS translation or direct left/top positioning
            // For better performance, transform is preferred but direct left/top works fine for simple implementation
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 100, fill: "forwards" });
        });

        // Add hover effect for clickable elements
        const clickables = document.querySelectorAll('a, button, .hamburger');
        clickables.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.backgroundColor = 'transparent';
            });
        });
    }

    /* =========================================
       2.5. Secret Admin Trigger
    ========================================= */
    const profileImage = document.querySelector('.profile-frame');
    let clickCount = 0;
    let clickTimer;

    if (profileImage) {
        profileImage.addEventListener('click', () => {
            clickCount++;

            if (clickCount === 3) {
                window.location.href = 'admin.html';
            }

            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000); // Reset if 3 clicks don't happen within 2 seconds
        });
    }

    /* =========================================
       3. Mobile Navigation
    ========================================= */
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    /* =========================================
       4. Navbar Scroll Effect
    ========================================= */
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* =========================================
       5. Typing Animation
    ========================================= */
    const typingText = document.getElementById('typing-text');
    let words = [
        "Full Stack Developer",
        "Web Developer",
        "CSE Student",
        "Aspiring AI Engineer"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeEffect() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50; // Faster when deleting
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100; // Normal typing speed
        }

        // Handle word completion and deletion
        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end of word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before typing next word
        }

        setTimeout(typeEffect, typeSpeed);
    }

    // Start typing effect after a short delay
    if (typingText) {
        setTimeout(typeEffect, 1500); // Wait a bit for loading screen to finish
    }

    /* =========================================
       7. Scroll Reveal Animations
    ========================================= */
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    /* =========================================
       8. Number Counter Animation
    ========================================= */
    const statNumbers = document.querySelectorAll('.stat-number');
    let animatedStats = false;

    const statsOptions = {
        threshold: 0.5,
        rootMargin: "0px"
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedStats) {
                animatedStats = true;

                statNumbers.forEach(stat => {
                    const target = +stat.getAttribute('data-target');
                    const duration = 2000; // 2 seconds
                    const increment = target / (duration / 16); // 60fps
                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            stat.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            stat.innerText = target;
                        }
                    };

                    updateCounter();
                });

                observer.disconnect();
            }
        });
    }, statsOptions);

    // Observe the stats grid parent if it exists
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        statsObserver.observe(statsGrid);
    }

    /* =========================================
       9. Skills Animation
    ========================================= */
    const skillsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate linear bars
                const bars = entry.target.querySelectorAll('.skill-bar-fill');
                bars.forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width;
                });

                // Animate circular progress
                const circles = entry.target.querySelectorAll('.circular-progress');
                circles.forEach(circle => {
                    const percent = circle.getAttribute('data-percent');
                    const circleFill = circle.querySelector('.circle-fill');
                    if (circleFill) {
                        const offset = 251.2 - (251.2 * percent / 100);
                        circleFill.style.strokeDashoffset = offset;
                    }
                });

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        skillsObserver.observe(skillsSection);
    }

    /* =========================================
       10. Active Navigation on Scroll
    ========================================= */
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 150; // offset for fixed navbar
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href*="#${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinksList.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    });

    /* =========================================
       11. Projects Data and Logic
    ========================================= */
    let projectsData = [
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

    const projectsContainer = document.getElementById('projects-container');
    const projectsCounter = document.getElementById('projects-counter');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Modal elements
    const modalOverlay = document.getElementById('project-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalImg = document.getElementById('modal-img');
    const modalCategory = document.getElementById('modal-category');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const modalTags = document.getElementById('modal-tags');
    const modalLiveBtn = document.getElementById('modal-live-btn');
    const modalGithubBtn = document.getElementById('modal-github-btn');

    function renderProjects(filter = 'all') {
        if (!projectsContainer) return;

        projectsContainer.innerHTML = '';

        const filteredProjects = projectsData.filter(project => {
            return filter === 'all' || project.filterId === filter;
        });

        if (projectsCounter) {
            projectsCounter.textContent = `Showing ${filteredProjects.length} Project${filteredProjects.length !== 1 ? 's' : ''}`;
        }

        filteredProjects.forEach((project, index) => {
            const card = document.createElement('div');
            card.classList.add('project-card');

            const techTagsHTML = (project.technologies || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('');

            card.innerHTML = `
                <div class="project-img-wrapper">
                    <img src="${project.image}" alt="${project.title}" class="project-img" onerror="this.style.display='none'; this.parentElement.classList.add('no-image');">
                    <div class="project-overlay"></div>
                </div>
                <div class="project-content">
                    <span class="project-badge">${project.category}</span>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-desc">${project.description}</p>
                    <div class="project-tech">
                        ${techTagsHTML}
                    </div>
                    <div class="project-buttons" style="display: flex; gap: 1rem;">
                        ${(project.liveLink && project.liveLink !== '#' && project.liveLink.trim() !== '') ? `<a href="${project.liveLink}" target="_blank" class="btn btn-primary card-action-btn" style="flex: 1; text-align: center;">Live Demo</a>` : ''}
                        ${(project.githubLink && project.githubLink !== '#' && project.githubLink.trim() !== '') ? `<a href="${project.githubLink}" target="_blank" class="btn btn-secondary card-action-btn" style="flex: 1; text-align: center;">GitHub</a>` : ''}
                    </div>
                </div>
            `;

            // Add click listener to the card
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                // Prevent redirect if clicking the action buttons directly
                if (!e.target.closest('.card-action-btn')) {
                    openModal(project);
                }
            });

            projectsContainer.appendChild(card);
        });
    }

    // Filter functionality
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add to clicked
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');
                renderProjects(filterValue);
            });
        });
    }

    // Modal functionality
    function openModal(project) {
        if (!modalOverlay) return;

        modalImg.src = project.image;
        modalImg.style.display = 'block';
        modalImg.parentElement.classList.remove('no-image');

        modalCategory.textContent = project.category;
        modalTitle.textContent = project.title;
        modalDesc.textContent = project.description;

        modalTags.innerHTML = (project.technologies || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('');

        modalLiveBtn.href = project.liveLink;
        modalGithubBtn.href = project.githubLink;

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // Initial render
    renderProjects();

    /* =========================================
       12. Certifications Data and Logic
    ========================================= */
    let certsData = [
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

    const certContainer = document.getElementById('cert-container');

    function renderCerts() {
        if (!certContainer) return;
        certContainer.innerHTML = '';
        certsData.forEach(cert => {
            const certCard = document.createElement('div');
            certCard.classList.add('cert-card');

            // Determine if brand or solid icon
            const iconClass = cert.icon === 'fa-certificate' ? 'fa-solid' : 'fa-brands';

            certCard.innerHTML = `
                <i class="${iconClass} ${cert.icon} cert-icon"></i>
                <h3 class="cert-name">${cert.title}</h3>
                <h4 class="cert-org">${cert.organization}</h4>
                <p class="cert-date">${cert.date}</p>
                <a href="${cert.link}" class="cert-btn" target="_blank" rel="noopener noreferrer">View Certificate <i class="fa-solid fa-arrow-right"></i></a>
            `;
            certContainer.appendChild(certCard);
        });
    }

    // Initial render
    renderCerts();

    /* =========================================
       12.6. Education Render Logic
    ========================================= */
    let educationData = [];
    const educationContainer = document.getElementById('education-container');

    function renderEducation() {
        if (!educationContainer) return;
        educationContainer.innerHTML = '';
        educationData.forEach(edu => {
            const eduCard = document.createElement('div');
            eduCard.classList.add('education-card', 'reveal-scale');
            
            let courseworkHTML = '';
            if (edu.coursework) {
                courseworkHTML = `<p class="edu-coursework"><strong>Relevant Coursework:</strong> ${edu.coursework}</p>`;
            }

            eduCard.innerHTML = `
                <div class="edu-icon-wrapper">
                    <i class="fa-solid fa-graduation-cap edu-icon"></i>
                </div>
                <div class="edu-details">
                    <h3 class="edu-degree">${edu.degree}</h3>
                    <h4 class="edu-major">${edu.major}</h4>
                    <p class="edu-university">${edu.university}</p>
                    <div class="edu-meta">
                        <span class="edu-status"><i class="fa-solid fa-user-graduate"></i> ${edu.status || ''}</span>
                        <span class="edu-year"><i class="fa-regular fa-calendar-check"></i> ${edu.year || ''}</span>
                    </div>
                    ${courseworkHTML}
                </div>
            `;
            educationContainer.appendChild(eduCard);
            
            if (typeof revealObserver !== 'undefined') {
                revealObserver.observe(eduCard);
            }
        });
    }

    /* =========================================
       12.7. Backend Integration (Dynamic Fetching)
    ========================================= */
    async function fetchBackendData() {
        const API_URL = 'http://localhost:5000/api';

        try {
            // Fetch Profile
            const profileRes = await fetch(`${API_URL}/profile`);
            if (profileRes.ok) {
                const profile = await profileRes.json();
                if (profile && profile.name) {
                    const nameEls = document.querySelectorAll('.hero-content h1, .profile-info h3');
                    if (nameEls[0]) {
                        const parts = profile.name.split(' ');
                        nameEls[0].innerHTML = `<span class="highlight">${parts[0]}</span> ${parts.slice(1).join(' ')}`.trim();
                    }
                    if (nameEls[1]) nameEls[1].textContent = profile.name;

                    if (profile.role) {
                        const rolesArray = profile.role.split(',').map(r => r.trim()).filter(r => r);
                        if (rolesArray.length > 0) {
                            words = rolesArray;
                            const aboutRoleEl = document.querySelector('.about-role');
                            if (aboutRoleEl) aboutRoleEl.textContent = rolesArray[0];
                        }
                    }

                    const aboutEl = document.querySelector('.about-text p');
                    if (aboutEl) aboutEl.textContent = profile.aboutText;
                }
            }

            // Fetch Projects
            const projRes = await fetch(`${API_URL}/projects`);
            if (projRes.ok) {
                const projs = await projRes.json();
                if (projs.length > 0) {
                    projectsData = projs;
                    renderProjects();
                }
            }

            // Fetch Certifications
            const certsRes = await fetch(`${API_URL}/certifications`);
            if (certsRes.ok) {
                const certs = await certsRes.json();
                if (certs.length > 0) {
                    certsData = certs;
                    renderCerts();
                }
            }

            // Fetch Education
            const eduRes = await fetch(`${API_URL}/education`);
            if (eduRes.ok) {
                const edus = await eduRes.json();
                if (edus.length > 0) {
                    educationData = edus;
                    renderEducation();
                }
            }
        } catch (error) {
            console.log('Backend not available, using fallback static data.');
        }
    }

    // Call backend fetch
    fetchBackendData();

    // Connect timeline and education/certs to existing reveal logic
    const additionalRevealElements = document.querySelectorAll('.timeline-item, .education-card, .cert-card');
    if (typeof revealObserver !== 'undefined') {
        additionalRevealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }

    /* =========================================
       13. Contact Form Validation
    ========================================= */
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;

            // Name validation
            const nameInput = document.getElementById('name');
            if (nameInput.value.trim() === '') {
                nameInput.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                nameInput.parentElement.classList.remove('invalid');
            }

            // Email validation
            const emailInput = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                emailInput.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                emailInput.parentElement.classList.remove('invalid');
            }

            // Subject validation
            const subjectInput = document.getElementById('subject');
            if (subjectInput.value.trim() === '') {
                subjectInput.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                subjectInput.parentElement.classList.remove('invalid');
            }

            // Message validation
            const messageInput = document.getElementById('message');
            if (messageInput.value.trim() === '') {
                messageInput.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                messageInput.parentElement.classList.remove('invalid');
            }

            if (isValid) {
                // Send form data to Formspree
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span>Sending...</span><i class="fa-solid fa-spinner fa-spin"></i>';
                submitBtn.disabled = true;

                fetch('https://formspree.io/f/xqpazoql', {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(response => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;

                    if (response.ok) {
                        // Show success message
                        formSuccess.classList.add('show');
                        // Clear form
                        contactForm.reset();
                        // Hide success message after 5 seconds
                        setTimeout(() => {
                            formSuccess.classList.remove('show');
                        }, 5000);
                    } else {
                        alert("Oops! There was a problem sending your message.");
                    }
                }).catch(error => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    alert("Oops! There was a problem sending your message.");
                });
            }
        });

        // Remove invalid class on input
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function () {
                this.parentElement.classList.remove('invalid');
            });
        });
    }

    /* =========================================
       14. Back to Top Button
    ========================================= */
    const backToTopBtn = document.getElementById('backToTopBtn');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

/* =========================================
   6. Loading Screen
========================================= */
// We use window.onload to ensure all resources (including images if any) are loaded
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        // Add a small artificial delay to ensure the animation is seen (optional, but requested for premium feel)
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');

            // Remove from DOM after fade out completes to prevent blocking interactions
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 800); // matches the CSS transition duration
        }, 500);
    }
});
