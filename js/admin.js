const LOCAL_API = 'http://localhost:5000/api';
const PROD_API = 'https://portfolio-backend-51pc.onrender.com/api';

const isLocalHost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.protocol === 'file:' || 
                    !window.location.hostname;

let API_URL = isLocalHost ? LOCAL_API : PROD_API;
let FALLBACK_API_URL = isLocalHost ? PROD_API : LOCAL_API;
let token = sessionStorage.getItem('adminToken');

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Theme Management (Dark/Light Mode)
    const htmlElement = document.documentElement;

    function getSystemTheme() {
        return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }

    function initTheme() {
        const isOverridden = localStorage.getItem('portfolio-theme-overridden') === 'true';
        const savedTheme = localStorage.getItem('portfolio-theme');
        const theme = (isOverridden && savedTheme) ? savedTheme : getSystemTheme();
        htmlElement.setAttribute('data-theme', theme);
    }

    initTheme();

    // Listen for system theme changes (updates if not manually overridden)
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const isOverridden = localStorage.getItem('portfolio-theme-overridden') === 'true';
            if (!isOverridden) {
                const newTheme = e.matches ? 'dark' : 'light';
                htmlElement.setAttribute('data-theme', newTheme);
            }
        });
    }

    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || getSystemTheme();
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
    const loginError = document.getElementById('loginError');

    // Automatically clear error message when typing
    ['email', 'password'].forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('input', () => {
                if (loginError) {
                    loginError.textContent = '';
                    loginError.style.display = 'none';
                }
            });
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            if (loginError) {
                loginError.textContent = '';
                loginError.style.display = 'none';
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
            }
            
            try {
                let res;
                try {
                    res = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                } catch (networkErr) {
                    if (FALLBACK_API_URL && FALLBACK_API_URL !== API_URL) {
                        console.warn(`Primary endpoint (${API_URL}) failed, trying fallback (${FALLBACK_API_URL})...`);
                        res = await fetch(`${FALLBACK_API_URL}/auth/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password })
                        });
                        API_URL = FALLBACK_API_URL;
                    } else {
                        throw networkErr;
                    }
                }
                
                const data = await res.json();
                
                if (res.ok) {
                    sessionStorage.setItem('adminToken', data.token);
                    token = data.token;
                    checkAuth();
                } else {
                    if (loginError) {
                        loginError.textContent = data.message || 'Invalid credentials';
                        loginError.style.display = 'block';
                    }
                }
            } catch (err) {
                console.error('Login error:', err);
                if (loginError) {
                    loginError.textContent = 'Server connection failed. Ensure backend is running (npm run dev) or try again in a moment.';
                    loginError.style.display = 'block';
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Login';
                }
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
    setupProfilePicForm();
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
                const preview = document.getElementById('profile-pic-preview');
                if (preview) {
                    const picUrl = profile.profileImage || 'assets/profile.jpg';
                    preview.src = `${picUrl}?v=${Date.now()}`;
                }
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

let currentProfilePicFile = null;

function applyProfilePicFile(file, isPasted = false) {
    if (!file || !file.type.startsWith('image/')) return;
    currentProfilePicFile = file;

    const fileInput = document.getElementById('profile-pic-file');
    const preview = document.getElementById('profile-pic-preview');
    const nameEl = document.getElementById('profile-pic-name');
    const dropzone = document.getElementById('profile-pic-dropzone');

    if (fileInput) {
        try {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
        } catch (e) {}
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        if (preview) preview.src = e.target.result;
        if (nameEl) {
            nameEl.textContent = `${isPasted ? '📋 Pasted: ' : 'Selected: '}${file.name} (${formatBytes(file.size)})`;
        }
        if (dropzone) {
            dropzone.classList.remove('paste-flash');
            void dropzone.offsetWidth;
            dropzone.classList.add('paste-flash');
        }
        if (isPasted) {
            showPasteToast('Profile photo pasted! Click "Upload Profile Picture" to save.');
        }
    };
    reader.readAsDataURL(file);
}

function setupProfilePicForm() {
    const form = document.getElementById('profilePicUploadForm');
    const fileInput = document.getElementById('profile-pic-file');
    const preview = document.getElementById('profile-pic-preview');
    const msg = document.getElementById('profilePicMsg');
    const dropzone = document.getElementById('profile-pic-dropzone');
    if (!form || !fileInput) return;

    if (dropzone) {
        dropzone.addEventListener('click', () => {
            fileInput.click();
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzone.classList.remove('drag-over');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith('image/')) {
                    applyProfilePicFile(file, false);
                }
            }
        });

        dropzone.addEventListener('paste', (e) => {
            const file = extractImageFromClipboard(e);
            if (file) {
                e.preventDefault();
                e.stopPropagation();
                applyProfilePicFile(file, true);
            }
        });
    }

    // Instant local preview when an image file is selected via file picker
    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
            applyProfilePicFile(fileInput.files[0], false);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileToUpload = currentProfilePicFile || (fileInput.files && fileInput.files[0]);
        if (!fileToUpload) {
            alert('Please select or paste an image file first.');
            return;
        }

        const formData = new FormData();
        formData.append('profileImage', fileToUpload);

        const btn = document.getElementById('uploadPicBtn') || form.querySelector('button[type="submit"]');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
        btn.disabled = true;

        try {
            let res;
            try {
                res = await fetch(`${API_URL}/upload/profile-image`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            } catch (networkErr) {
                if (FALLBACK_API_URL && FALLBACK_API_URL !== API_URL) {
                    res = await fetch(`${FALLBACK_API_URL}/upload/profile-image`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    });
                    API_URL = FALLBACK_API_URL;
                } else {
                    throw networkErr;
                }
            }

            const data = await res.json();
            if (res.ok) {
                if (preview && data.imageUrl) {
                    preview.src = `${data.imageUrl}?v=${Date.now()}`;
                }
                if (msg) {
                    msg.textContent = 'Profile picture updated successfully!';
                    setTimeout(() => { if (msg) msg.textContent = ''; }, 4000);
                }
                currentProfilePicFile = null;
                fileInput.value = '';
                const nameEl = document.getElementById('profile-pic-name');
                if (nameEl) nameEl.textContent = '';
                showPasteToast('Profile picture saved successfully!');
            } else {
                alert(data.message || 'Failed to upload profile picture.');
            }
        } catch (err) {
            console.error('Failed to upload profile picture:', err);
            alert('Upload failed. Please check your connection and try again.');
        } finally {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
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
// -----------------------------------------
// IMAGE PASTE & DROPZONE HELPERS
// -----------------------------------------

function showPasteToast(message, isSuccess = true) {
    const existing = document.querySelector('.paste-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'paste-toast';
    toast.innerHTML = `
        <i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation'}" style="color: ${isSuccess ? '#2ed573' : '#ff4757'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function extractImageFromClipboard(e) {
    if (!e.clipboardData) return null;
    const items = e.clipboardData.items;
    if (items) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].type && items[i].type.startsWith('image/')) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const ext = blob.type.split('/')[1] || 'png';
                    const safeExt = ext.replace('+xml', '').replace('jpeg', 'jpg');
                    return new File([blob], `pasted-${Date.now()}.${safeExt}`, { type: blob.type });
                }
            }
        }
    }
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
            return file;
        }
    }
    return null;
}

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

let currentProjectImageFile = null;
let currentProjectExistingImageUrl = null;

function setProjectImagePreview(src, badgeText = 'Selected Image', fileName = '', isPasted = false) {
    const dropzone = document.getElementById('proj-image-dropzone');
    const prompt = document.getElementById('proj-dropzone-prompt');
    const previewContainer = document.getElementById('proj-dropzone-preview');
    const previewImg = document.getElementById('proj-image-preview');
    const badge = document.getElementById('proj-image-badge');
    const nameEl = document.getElementById('proj-image-name');

    if (!dropzone || !previewContainer || !previewImg) return;

    previewImg.src = src;
    previewContainer.style.display = 'block';
    if (prompt) prompt.style.display = 'none';

    if (badge) {
        badge.textContent = badgeText;
        if (isPasted) {
            badge.classList.add('pasted');
            badge.innerHTML = '<i class="fa-regular fa-paste"></i> Pasted from Clipboard';
        } else {
            badge.classList.remove('pasted');
        }
    }

    if (nameEl) {
        nameEl.textContent = fileName;
    }

    dropzone.classList.remove('paste-flash');
    void dropzone.offsetWidth;
    dropzone.classList.add('paste-flash');
}

function clearProjectImage(preserveExistingIfAny = false) {
    const dropzone = document.getElementById('proj-image-dropzone');
    const prompt = document.getElementById('proj-dropzone-prompt');
    const previewContainer = document.getElementById('proj-dropzone-preview');
    const previewImg = document.getElementById('proj-image-preview');
    const fileInput = document.getElementById('proj-image');
    const nameEl = document.getElementById('proj-image-name');

    currentProjectImageFile = null;
    if (fileInput) fileInput.value = '';

    if (preserveExistingIfAny && currentProjectExistingImageUrl) {
        setProjectImagePreview(
            currentProjectExistingImageUrl.startsWith('http') ? currentProjectExistingImageUrl : `/${currentProjectExistingImageUrl}`,
            'Current Image',
            `Current: ${currentProjectExistingImageUrl.split('/').pop()}`,
            false
        );
        return;
    }

    currentProjectExistingImageUrl = null;
    if (previewImg) previewImg.src = '';
    if (previewContainer) previewContainer.style.display = 'none';
    if (prompt) prompt.style.display = 'flex';
    if (nameEl) nameEl.textContent = '';
    if (dropzone) dropzone.classList.remove('paste-flash');
}

function applyProjectImageFile(file, isPasted = false) {
    if (!file || !file.type.startsWith('image/')) return;
    currentProjectImageFile = file;

    const fileInput = document.getElementById('proj-image');
    if (fileInput) {
        try {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
        } catch (e) {}
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const sizeText = formatBytes(file.size);
        const fileName = `${file.name} (${sizeText})`;
        setProjectImagePreview(
            e.target.result,
            isPasted ? 'Pasted from Clipboard' : 'Selected Image',
            fileName,
            isPasted
        );
        if (isPasted) {
            showPasteToast(`Project image pasted (${sizeText})!`);
        }
    };
    reader.readAsDataURL(file);
}

function setupProjectDropzone() {
    const dropzone = document.getElementById('proj-image-dropzone');
    const fileInput = document.getElementById('proj-image');
    const replaceBtn = document.getElementById('proj-replace-btn');
    const removeBtn = document.getElementById('proj-remove-btn');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', (e) => {
        if (e.target.closest('.preview-actions')) return;
        fileInput.click();
    });

    if (replaceBtn) {
        replaceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearProjectImage(false);
        });
    }

    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
            applyProjectImageFile(fileInput.files[0], false);
        }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('drag-over');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                applyProjectImageFile(file, false);
            } else {
                alert('Please drop an image file (PNG, JPG, WEBP, etc.).');
            }
        }
    });

    dropzone.addEventListener('paste', (e) => {
        const file = extractImageFromClipboard(e);
        if (file) {
            e.preventDefault();
            e.stopPropagation();
            applyProjectImageFile(file, true);
        }
    });
}

// Global paste listener: catches Ctrl+V anywhere when Project Modal or Profile View is active
document.addEventListener('paste', (e) => {
    const imageFile = extractImageFromClipboard(e);
    if (!imageFile) return;

    const projectModal = document.getElementById('projectModal');
    if (projectModal && projectModal.classList.contains('active')) {
        e.preventDefault();
        applyProjectImageFile(imageFile, true);
        return;
    }

    const profileView = document.getElementById('view-profile');
    if (profileView && profileView.classList.contains('active-view')) {
        e.preventDefault();
        applyProfilePicFile(imageFile, true);
        return;
    }
});

// -----------------------------------------
// PROJECTS CRUD
// -----------------------------------------

async function loadProjects() {
    const tbody = document.getElementById('projectsTableBody');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    try {
        let res;
        try {
            res = await fetch(`${API_URL}/projects`);
        } catch (networkErr) {
            if (FALLBACK_API_URL && FALLBACK_API_URL !== API_URL) {
                res = await fetch(`${FALLBACK_API_URL}/projects`);
                API_URL = FALLBACK_API_URL;
            } else {
                throw networkErr;
            }
        }

        if (res && res.ok) {
            const projects = await res.json();
            tbody.innerHTML = '';
            projects.forEach(p => {
                const tr = document.createElement('tr');
                const imgSrc = p.image ? (p.image.startsWith('http') ? p.image : `/${p.image}`) : '';
                tr.innerHTML = `
                    <td>
                        ${imgSrc ? `<img src="${imgSrc}" class="table-img-thumb" alt="${p.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="table-img-placeholder" style="display:none;"><i class="fa-solid fa-image"></i></div>` : `<div class="table-img-placeholder"><i class="fa-solid fa-image"></i></div>`}
                    </td>
                    <td><strong>${p.title}</strong></td>
                    <td><span class="preview-badge">${p.category}</span></td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="editProject('${p._id}')"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteProject('${p._id}')"><i class="fa-solid fa-trash"></i> Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch(err) {
        tbody.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
}

function setupProjectForm() {
    const form = document.getElementById('projectForm');
    if (!form) return;
    
    setupProjectDropzone();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('proj-id').value;
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;
        
        try {
            let imageUrl = null;
            const fileToUpload = currentProjectImageFile || (document.getElementById('proj-image')?.files[0]);

            if (fileToUpload) {
                const formData = new FormData();
                formData.append('image', fileToUpload);
                
                let uploadRes;
                try {
                    uploadRes = await fetch(`${API_URL}/upload/project-image`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    });
                } catch (networkErr) {
                    if (FALLBACK_API_URL && FALLBACK_API_URL !== API_URL) {
                        uploadRes = await fetch(`${FALLBACK_API_URL}/upload/project-image`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: formData
                        });
                        API_URL = FALLBACK_API_URL;
                    } else {
                        throw networkErr;
                    }
                }
                
                if (uploadRes && uploadRes.ok) {
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
            } else if (currentProjectExistingImageUrl) {
                data.image = currentProjectExistingImageUrl;
            }
            
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_URL}/projects/${id}` : `${API_URL}/projects`;
            
            let res;
            try {
                res = await fetch(url, {
                    method: method,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });
            } catch (networkErr) {
                if (FALLBACK_API_URL && FALLBACK_API_URL !== API_URL) {
                    const fallbackUrl = id ? `${FALLBACK_API_URL}/projects/${id}` : `${FALLBACK_API_URL}/projects`;
                    res = await fetch(fallbackUrl, {
                        method: method,
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(data)
                    });
                    API_URL = FALLBACK_API_URL;
                } else {
                    throw networkErr;
                }
            }

            if (res && res.ok) {
                closeModal('projectModal');
                loadProjects();
                fetchStats();
                showPasteToast('Project saved successfully!');
            } else {
                alert('Failed to save project. Please check fields.');
            }
        } catch(err) {
            console.error(err);
            alert('An error occurred while saving the project.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

window.editProject = async (id) => {
    try {
        let res;
        try {
            res = await fetch(`${API_URL}/projects`);
        } catch (networkErr) {
            if (FALLBACK_API_URL && FALLBACK_API_URL !== API_URL) {
                res = await fetch(`${FALLBACK_API_URL}/projects`);
                API_URL = FALLBACK_API_URL;
            } else {
                throw networkErr;
            }
        }

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
            
            if (p.image) {
                currentProjectExistingImageUrl = p.image;
                currentProjectImageFile = null;
                setProjectImagePreview(
                    p.image.startsWith('http') ? p.image : `/${p.image}`,
                    'Current Image',
                    `Current: ${p.image.split('/').pop()}`,
                    false
                );
            } else {
                clearProjectImage(false);
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
        clearProjectImage(false);
    } else if (id === 'skillModal' && !document.getElementById('skill-id').value) {
        document.getElementById('skillForm').reset();
    } else if (id === 'experienceModal' && !document.getElementById('exp-id').value) {
        document.getElementById('experienceForm').reset();
    } else if (id === 'certificationModal' && !document.getElementById('cert-id').value) {
        document.getElementById('certificationForm').reset();
    }
    
    document.getElementById(id).classList.add('active');
};
window.closeModal = (id) => {
    document.getElementById(id).classList.remove('active');
    if (id === 'projectModal') {
        document.getElementById('proj-id').value = '';
        clearProjectImage(false);
    }
    if (id === 'skillModal') document.getElementById('skill-id').value = '';
    if (id === 'experienceModal') document.getElementById('exp-id').value = '';
    if (id === 'certificationModal') document.getElementById('cert-id').value = '';
};
