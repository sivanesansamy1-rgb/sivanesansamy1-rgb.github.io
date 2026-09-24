const API_URL = 'http://localhost:5000/api';
let token = sessionStorage.getItem('adminToken');

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Theme Management (Dark/Light Mode)
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
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

    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
            localStorage.setItem('portfolio-theme-overridden', 'true');
        });
    });
    
    // Password Toggle Logic
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    sessionStorage.setItem('adminToken', data.token);
                    token = data.token;
                    checkAuth();
                } else {
                    document.getElementById('loginError').textContent = data.message;
                    document.getElementById('loginError').style.display = 'block';
                }
            } catch (err) {
                console.error(err);
                document.getElementById('loginError').textContent = 'Server connection failed';
                document.getElementById('loginError').style.display = 'block';
            }
        });
    }

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('adminToken');
        token = null;
        const form = document.getElementById('loginForm');
        if (form) form.reset();
        window.location.href = 'index.html';
    });

    // Navigation
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget.getAttribute('data-target');
            if (target) {
                // Update active nav
                navItems.forEach(n => n.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Show target view
                document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active-view'));
                document.getElementById(`view-${target}`).classList.add('active-view');
                
                // Load data if needed
                if (target === 'projects') loadProjects();
                if (target === 'profile') loadProfile();
                if (target === 'skills') loadSkills();
                if (target === 'experience') loadExperience();
                if (target === 'education') loadEducation();
                if (target === 'certifications') loadCertifications();
            }
        });
    });

    // Mobile Menu
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });

    // Forms setup
    setupProjectForm();
    setupProfileForm();
    setupResumeForm();
    setupSkillForm();
    setupExperienceForm();
    setupEducationForm();
    setupCertificationForm();

    // Delete Modal Setup
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (pendingDeleteAction) {
                pendingDeleteAction();
                pendingDeleteAction = null;
            }
            closeModal('deleteModal');
        });
    }
});

let pendingDeleteAction = null;
function showDeleteConfirm(msg, action) {
    document.getElementById('deleteModalMessage').textContent = msg;
    pendingDeleteAction = action;
    openModal('deleteModal');
}

function checkAuth() {
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    
    if (token) {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'flex';
        fetchStats();
    } else {
        loginScreen.style.display = 'flex';
        dashboardScreen.style.display = 'none';
    }
}

// -----------------------------------------
// DATA FETCHING & RENDERING
// -----------------------------------------

async function fetchStats() {
    try {
        const projRes = await fetch(`${API_URL}/projects`);
        if (projRes.ok) {
            const projs = await projRes.json();
            document.getElementById('stat-projects').textContent = projs.length;
        }
        const skillsRes = await fetch(`${API_URL}/skills`);
        if (skillsRes.ok) {
            const skills = await skillsRes.json();
            document.getElementById('stat-skills').textContent = skills.length;
        }
    } catch (e) {
        console.error('Failed to fetch stats');
    }
}

async function loadProfile() {
    try {
        const res = await fetch(`${API_URL}/profile`);
        if (res.ok) {
            const profile = await res.json();
            if (profile) {
                document.getElementById('prof-name').value = profile.name || '';
                document.getElementById('prof-role').value = profile.role || '';
                document.getElementById('prof-about').value = profile.aboutText || '';
                document.getElementById('prof-email').value = profile.email || '';
                document.getElementById('prof-location').value = profile.location || '';
                document.getElementById('prof-linkedin').value = profile.linkedin || '';
                document.getElementById('prof-github').value = profile.github || '';
            }
        }
    } catch (e) {
        console.error('Failed to load profile', e);
    }
}

function setupProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('prof-name').value,
            role: document.getElementById('prof-role').value,
            aboutText: document.getElementById('prof-about').value,
            email: document.getElementById('prof-email').value,
            location: document.getElementById('prof-location').value,
            linkedin: document.getElementById('prof-linkedin').value,
            github: document.getElementById('prof-github').value,
        };
        
        try {
            const res = await fetch(`${API_URL}/profile`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const msg = document.getElementById('profileMsg');
                msg.textContent = 'Profile saved!';
                setTimeout(() => msg.textContent = '', 3000);
            }
        } catch(err) {
            console.error(err);
        }
    });
}

function setupResumeForm() {
    const form = document.getElementById('resumeUploadForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('resume-file');
        if (!fileInput.files.length) return;

        const formData = new FormData();
        formData.append('resume', fileInput.files[0]);

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Uploading...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_URL}/upload/resume`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type header manually when using FormData
                },
                body: formData
            });

            const msg = document.getElementById('resumeMsg');
            if (res.ok) {
                msg.textContent = 'Resume uploaded successfully!';
                msg.style.color = 'var(--text-secondary)';
                form.reset();
            } else {
                msg.textContent = 'Failed to upload resume.';
                msg.style.color = 'red';
            }
            setTimeout(() => { msg.textContent = ''; }, 3000);
        } catch(err) {
            console.error(err);
            alert('An error occurred while uploading.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

// -----------------------------------------
// PROJECTS CRUD
// -----------------------------------------

async function loadProjects() {
    const tbody = document.getElementById('projectsTableBody');
    tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
    try {
        const res = await fetch(`${API_URL}/projects`);
        if (res.ok) {
            const projects = await res.json();
            tbody.innerHTML = '';
            projects.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.title}</td>
                    <td>${p.category}</td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="editProject('${p._id}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteProject('${p._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch(err) {
        tbody.innerHTML = '<tr><td colspan="3">Error loading data.</td></tr>';
    }
}

function setupProjectForm() {
    const form = document.getElementById('projectForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('proj-id').value;
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;
        
        try {
            let imageUrl = null;
            const fileInput = document.getElementById('proj-image');
            if (fileInput && fileInput.files.length > 0) {
                const formData = new FormData();
                formData.append('image', fileInput.files[0]);
                
                const uploadRes = await fetch(`${API_URL}/upload/project-image`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    imageUrl = uploadData.imageUrl;
                }
            }

            const data = {
                title: document.getElementById('proj-title').value,
                category: document.getElementById('proj-category').value,
                filterId: document.getElementById('proj-filter').value,
                description: document.getElementById('proj-desc').value,
                technologies: document.getElementById('proj-tech').value.split(',').map(s => s.trim()).filter(Boolean),
                liveLink: document.getElementById('proj-livelink').value,
                githubLink: document.getElementById('proj-githublink').value
            };
            
            if (imageUrl) {
                data.image = imageUrl;
            }
            
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_URL}/projects/${id}` : `${API_URL}/projects`;
            
            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                closeModal('projectModal');
                loadProjects();
                fetchStats();
            }
        } catch(err) {
            console.error(err);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

window.editProject = async (id) => {
    try {
        const res = await fetch(`${API_URL}/projects`);
        const projects = await res.json();
        const p = projects.find(x => x._id === id);
        if (p) {
            document.getElementById('proj-id').value = p._id;
            document.getElementById('proj-title').value = p.title;
            document.getElementById('proj-category').value = p.category;
            document.getElementById('proj-filter').value = p.filterId;
            document.getElementById('proj-desc').value = p.description;
            document.getElementById('proj-tech').value = (p.technologies || []).join(', ');
            document.getElementById('proj-livelink').value = p.liveLink || '';
            document.getElementById('proj-githublink').value = p.githubLink || '';
            
            const previewImg = document.getElementById('proj-image-preview');
            const previewName = document.getElementById('proj-image-name');
            if (p.image) {
                previewImg.src = p.image.startsWith('http') ? p.image : `/${p.image}`;
                previewImg.style.display = 'block';
                previewName.textContent = `Current image: ${p.image.split('/').pop()}`;
            } else {
                previewImg.style.display = 'none';
                previewName.textContent = '';
            }
            
            openModal('projectModal');
        }
    } catch (e) {
        console.error(e);
    }
};

window.deleteProject = async (id) => {
    showDeleteConfirm('Are you sure you want to delete this project?', async () => {
        try {
            const res = await fetch(`${API_URL}/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                loadProjects();
                fetchStats();
            }
        } catch (e) {
            console.error(e);
        }
    });
};

// -----------------------------------------
// SKILLS CRUD
// -----------------------------------------

async function loadSkills() {
    const tbody = document.getElementById('skillsTableBody');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    try {
        const res = await fetch(`${API_URL}/skills`);
        if (res.ok) {
            const skills = await res.json();
            tbody.innerHTML = '';
            skills.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${s.name}</td>
                    <td>${s.category}</td>
                    <td>${s.percentage}%</td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="editSkill('${s._id}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteSkill('${s._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch(err) {
        tbody.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
}

function setupSkillForm() {
    const form = document.getElementById('skillForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('skill-id').value;
        const data = {
            name: document.getElementById('skill-name').value,
            category: document.getElementById('skill-category').value,
            percentage: parseInt(document.getElementById('skill-percentage').value)
        };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/skills/${id}` : `${API_URL}/skills`;
        
        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (res.ok) { closeModal('skillModal'); loadSkills(); fetchStats(); }
        } catch(err) { console.error(err); }
    });
}

window.editSkill = async (id) => {
    try {
        const res = await fetch(`${API_URL}/skills`);
        const data = await res.json();
        const s = data.find(x => x._id === id);
        if (s) {
            document.getElementById('skill-id').value = s._id;
            document.getElementById('skill-name').value = s.name;
            document.getElementById('skill-category').value = s.category;
            document.getElementById('skill-percentage').value = s.percentage;
            openModal('skillModal');
        }
    } catch (e) { console.error(e); }
};

window.deleteSkill = async (id) => {
    showDeleteConfirm('Are you sure you want to delete this skill?', async () => {
        try {
            const res = await fetch(`${API_URL}/skills/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { loadSkills(); fetchStats(); }
        } catch (e) { console.error(e); }
    });
};

// -----------------------------------------
// EXPERIENCE CRUD
// -----------------------------------------

async function loadExperience() {
    const tbody = document.getElementById('experienceTableBody');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    try {
        const res = await fetch(`${API_URL}/experience`);
        if (res.ok) {
            const exps = await res.json();
            tbody.innerHTML = '';
            exps.forEach(e => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${e.title}</td>
                    <td>${e.organization}</td>
                    <td>${e.date}</td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="editExperience('${e._id}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteExperience('${e._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch(err) {
        tbody.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
}

function setupExperienceForm() {
    const form = document.getElementById('experienceForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('exp-id').value;
        const data = {
            title: document.getElementById('exp-title').value,
            organization: document.getElementById('exp-org').value,
            date: document.getElementById('exp-date').value,
            mode: document.getElementById('exp-mode').value,
            description: document.getElementById('exp-desc').value
        };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/experience/${id}` : `${API_URL}/experience`;
        
        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (res.ok) { closeModal('experienceModal'); loadExperience(); }
        } catch(err) { console.error(err); }
    });
}

window.editExperience = async (id) => {
    try {
        const res = await fetch(`${API_URL}/experience`);
        const data = await res.json();
        const e = data.find(x => x._id === id);
        if (e) {
            document.getElementById('exp-id').value = e._id;
            document.getElementById('exp-title').value = e.title;
            document.getElementById('exp-org').value = e.organization;
            document.getElementById('exp-date').value = e.date;
            document.getElementById('exp-mode').value = e.mode || '';
            document.getElementById('exp-desc').value = e.description;
            openModal('experienceModal');
        }
    } catch (e) { console.error(e); }
};

window.deleteExperience = async (id) => {
    showDeleteConfirm('Are you sure you want to delete this experience?', async () => {
        try {
            const res = await fetch(`${API_URL}/experience/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { loadExperience(); }
        } catch (e) { console.error(e); }
    });
};

// -----------------------------------------
// EDUCATION CRUD
// -----------------------------------------

async function loadEducation() {
    const tbody = document.getElementById('educationTableBody');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    try {
        const res = await fetch(`${API_URL}/education`);
        if (res.ok) {
            const edus = await res.json();
            tbody.innerHTML = '';
            edus.forEach(e => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${e.degree}</td>
                    <td>${e.university}</td>
                    <td>${e.year}</td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="editEducation('${e._id}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteEducation('${e._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch(err) {
        tbody.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
}

function setupEducationForm() {
    const form = document.getElementById('educationForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edu-id').value;
        const data = {
            degree: document.getElementById('edu-degree').value,
            major: document.getElementById('edu-major').value,
            university: document.getElementById('edu-university').value,
            status: document.getElementById('edu-status').value,
            year: document.getElementById('edu-year').value,
            coursework: document.getElementById('edu-coursework').value
        };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/education/${id}` : `${API_URL}/education`;
        
        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (res.ok) { closeModal('educationModal'); loadEducation(); }
        } catch(err) { console.error(err); }
    });
}

window.editEducation = async (id) => {
    try {
        const res = await fetch(`${API_URL}/education`);
        const data = await res.json();
        const e = data.find(x => x._id === id);
        if (e) {
            document.getElementById('edu-id').value = e._id;
            document.getElementById('edu-degree').value = e.degree;
            document.getElementById('edu-major').value = e.major;
            document.getElementById('edu-university').value = e.university;
            document.getElementById('edu-status').value = e.status || '';
            document.getElementById('edu-year').value = e.year || '';
            document.getElementById('edu-coursework').value = e.coursework || '';
            openModal('educationModal');
        }
    } catch (e) { console.error(e); }
};

window.deleteEducation = async (id) => {
    showDeleteConfirm('Are you sure you want to delete this education entry?', async () => {
        try {
            const res = await fetch(`${API_URL}/education/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { loadEducation(); }
        } catch (e) { console.error(e); }
    });
};

// -----------------------------------------
// CERTIFICATIONS CRUD
// -----------------------------------------

async function loadCertifications() {
    const tbody = document.getElementById('certificationsTableBody');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    try {
        const res = await fetch(`${API_URL}/certifications`);
        if (res.ok) {
            const certs = await res.json();
            tbody.innerHTML = '';
            certs.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${c.title}</td>
                    <td>${c.organization}</td>
                    <td>${c.date}</td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="editCertification('${c._id}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteCertification('${c._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch(err) {
        tbody.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
}

function setupCertificationForm() {
    const form = document.getElementById('certificationForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('cert-id').value;
        const data = {
            title: document.getElementById('cert-title').value,
            organization: document.getElementById('cert-org').value,
            date: document.getElementById('cert-date').value,
            icon: document.getElementById('cert-icon').value,
            link: document.getElementById('cert-link').value
        };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/certifications/${id}` : `${API_URL}/certifications`;
        
        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (res.ok) { closeModal('certificationModal'); loadCertifications(); }
        } catch(err) { console.error(err); }
    });
}

window.editCertification = async (id) => {
    try {
        const res = await fetch(`${API_URL}/certifications`);
        const data = await res.json();
        const c = data.find(x => x._id === id);
        if (c) {
            document.getElementById('cert-id').value = c._id;
            document.getElementById('cert-title').value = c.title;
            document.getElementById('cert-org').value = c.organization;
            document.getElementById('cert-date').value = c.date;
            document.getElementById('cert-icon').value = c.icon || 'fa-certificate';
            document.getElementById('cert-link').value = c.link || '#';
            openModal('certificationModal');
        }
    } catch (e) { console.error(e); }
};

window.deleteCertification = async (id) => {
    showDeleteConfirm('Are you sure you want to delete this certification?', async () => {
        try {
            const res = await fetch(`${API_URL}/certifications/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { loadCertifications(); }
        } catch (e) { console.error(e); }
    });
};

// Modal functions
window.openModal = (id) => {
    if (id === 'projectModal' && !document.getElementById('proj-id').value) {
        document.getElementById('projectForm').reset();
    } else if (id === 'skillModal' && !document.getElementById('skill-id').value) {
        document.getElementById('skillForm').reset();
    } else if (id === 'experienceModal' && !document.getElementById('exp-id').value) {
        document.getElementById('experienceForm').reset();
    } else if (id === 'certificationModal' && !document.getElementById('cert-id').value) {
        document.getElementById('certificationForm').reset();
    }
    
    if (id === 'projectModal') {
        const fileInput = document.getElementById('proj-image');
        if (fileInput) fileInput.value = '';
        
        // Only clear the preview if we are adding a new project (no id)
        if (!document.getElementById('proj-id').value) {
            const previewImg = document.getElementById('proj-image-preview');
            const previewName = document.getElementById('proj-image-name');
            if (previewImg) previewImg.style.display = 'none';
            if (previewName) previewName.textContent = '';
        }
        
        // Add event listener to file input for preview
        if (fileInput && !fileInput.hasAttribute('data-preview-bound')) {
            fileInput.setAttribute('data-preview-bound', 'true');
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const previewImg = document.getElementById('proj-image-preview');
                        const previewName = document.getElementById('proj-image-name');
                        previewImg.src = e.target.result;
                        previewImg.style.display = 'block';
                        previewName.textContent = `Selected new image: ${fileInput.files[0].name}`;
                    }
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }
    }
    
    document.getElementById(id).classList.add('active');
};
window.closeModal = (id) => {
    document.getElementById(id).classList.remove('active');
    if (id === 'projectModal') document.getElementById('proj-id').value = '';
    if (id === 'skillModal') document.getElementById('skill-id').value = '';
    if (id === 'experienceModal') document.getElementById('exp-id').value = '';
    if (id === 'certificationModal') document.getElementById('cert-id').value = '';
};
