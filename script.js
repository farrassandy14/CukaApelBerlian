// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const registerForm = document.getElementById('registerForm');
const fileInput = document.getElementById('foto');
const productImg = document.getElementById('productImg');
const passwordInput = document.getElementById('password');

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
    
    // Animate hamburger menu
    const spans = menuToggle.querySelectorAll('span');
    if (menuToggle.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// File Input Validation and Preview
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (file) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            showNotification('Format file tidak didukung. Gunakan JPG atau PNG.', 'error');
            fileInput.value = '';
            return;
        }
        
        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showNotification('Ukuran file terlalu besar. Maximum 5MB.', 'error');
            fileInput.value = '';
            return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            // Create image element to check dimensions
            const img = new Image();
            img.onload = () => {
                // Check if image is square (1:1 ratio)
                const aspectRatio = img.width / img.height;
                if (Math.abs(aspectRatio - 1) > 0.1) {
                    showNotification('Gambar harus berbentuk persegi (rasio 1:1)', 'warning');
                }
                
                // Update product image preview
                productImg.src = e.target.result;
                productImg.style.borderRadius = '50%';
                productImg.style.width = '200px';
                productImg.style.height = '200px';
                productImg.style.objectFit = 'cover';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        
        showNotification('File berhasil dipilih!', 'success');
    }
});

// Password Strength Validator
passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    const strength = checkPasswordStrength(password);
    
    // Update visual feedback
    const hint = passwordInput.nextElementSibling;
    hint.innerHTML = `Password harus minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan simbol. <br><span class="strength-${strength.level}">Kekuatan: ${strength.text}</span>`;
});

// Password Strength Checker
function checkPasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('minimal 8 karakter');
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('huruf besar');
    
    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('huruf kecil');
    
    // Number check
    if (/\d/.test(password)) score += 1;
    else feedback.push('angka');
    
    // Symbol check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('simbol');
    
    // Return strength level
    const levels = {
        0: { level: 'very-weak', text: 'Sangat Lemah' },
        1: { level: 'weak', text: 'Lemah' },
        2: { level: 'fair', text: 'Cukup' },
        3: { level: 'good', text: 'Baik' },
        4: { level: 'strong', text: 'Kuat' },
        5: { level: 'very-strong', text: 'Sangat Kuat' }
    };
    
    return levels[score] || levels[0];
}

// Form Validation
function validateForm(formData) {
    const errors = [];
    
    // Name validation
    if (!formData.nama.trim()) {
        errors.push('Nama harus diisi');
    } else if (formData.nama.trim().length < 2) {
        errors.push('Nama harus minimal 2 karakter');
    }
    
    // Username validation
    if (!formData.username.trim()) {
        errors.push('Username harus diisi');
    } else if (formData.username.trim().length < 3) {
        errors.push('Username harus minimal 3 karakter');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        errors.push('Username hanya boleh mengandung huruf, angka, dan underscore');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
        errors.push('Email harus diisi');
    } else if (!emailRegex.test(formData.email)) {
        errors.push('Format email tidak valid');
    }
    
    // Password validation
    if (!formData.password) {
        errors.push('Password harus diisi');
    } else {
        const strength = checkPasswordStrength(formData.password);
        if (strength.level === 'very-weak' || strength.level === 'weak') {
            errors.push('Password terlalu lemah');
        }
    }
    
    return errors;
}

// Form Submission Handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(registerForm);
    const data = {
        nama: formData.get('nama'),
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        foto: formData.get('foto')
    };
    
    // Validate form
    const errors = validateForm(data);
    
    if (errors.length > 0) {
        showNotification('Terdapat kesalahan:\n' + errors.join('\n'), 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = registerForm.querySelector('.register-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Mendaftar...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        await simulateAPICall(data);
        
        // Success
        showNotification('Registrasi berhasil! Silakan cek email untuk verifikasi.', 'success');
        registerForm.reset();
        
        // Reset product image
        productImg.src = 'https://via.placeholder.com/400x600/4a5568/ffffff?text=Product+Image';
        productImg.style.borderRadius = '15px';
        productImg.style.width = 'auto';
        productImg.style.height = 'auto';
        productImg.style.objectFit = 'contain';
        
    } catch (error) {
        showNotification('Terjadi kesalahan saat mendaftar. Silakan coba lagi.', 'error');
        console.error('Registration error:', error);
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Simulate API Call
function simulateAPICall(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate random success/failure for demo
            if (Math.random() > 0.1) { // 90% success rate
                resolve({ success: true, message: 'Registration successful' });
            } else {
                reject(new Error('Network error'));
            }
        }, 2000); // 2 second delay to simulate network request
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message.replace(/\n/g, '<br>')}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// Social Login Handlers
document.querySelector('.google-btn').addEventListener('click', () => {
    showNotification('Fitur login Google akan segera tersedia', 'info');
});

document.querySelector('.github-btn').addEventListener('click', () => {
    showNotification('Fitur login GitHub akan segera tersedia', 'info');
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header Scroll Effect
let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add/remove scrolled class for styling
    if (scrollTop > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Hide/show header on scroll
    if (scrollTop > lastScrollTop && scrollTop > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Form Input Animations
const formInputs = document.querySelectorAll('.form-group input');

formInputs.forEach(input => {
    // Add focus effect
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    
    // Remove focus effect if empty
    input.addEventListener('blur', () => {
        if (!input.value.trim()) {
            input.parentElement.classList.remove('focused');
        }
    });
    
    // Check initial state
    if (input.value.trim()) {
        input.parentElement.classList.add('focused');
    }
});

// Newsletter Subscription
const newsletterForm = document.querySelector('.newsletter');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        if (!email.trim()) {
            showNotification('Masukkan alamat email yang valid', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Format email tidak valid', 'error');
            return;
        }
        
        // Simulate subscription
        showNotification('Terima kasih! Anda telah berlangganan newsletter kami.', 'success');
        newsletterForm.querySelector('input[type="email"]').value = '';
    });
}

// Terms and Conditions Link Handler
document.querySelector('.highlight').addEventListener('click', (e) => {
    e.preventDefault();
    showModal('Syarat dan Ketentuan', `
        <div class="terms-content">
            <h3>Syarat dan Ketentuan Pendaftaran</h3>
            <p>Dengan mendaftar di platform ini, Anda menyetujui:</p>
            <ol>
                <li>Memberikan informasi yang akurat dan valid</li>
                <li>Menjaga kerahasiaan akun dan password Anda</li>
                <li>Tidak menggunakan platform untuk aktivitas ilegal</li>
                <li>Mematuhi semua aturan dan regulasi yang berlaku</li>
                <li>Memahami bahwa akun dapat ditangguhkan jika melanggar aturan</li>
            </ol>
            <h3>Kebijakan Privasi</h3>
            <p>Kami berkomitmen melindungi data pribadi Anda sesuai dengan peraturan yang berlaku.</p>
            <p>Data yang dikumpulkan hanya akan digunakan untuk keperluan layanan dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda.</p>
        </div>
    `);
});

// Modal System
function showModal(title, content) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-header">
            <h2>${title}</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            ${content}
        </div>
        <div class="modal-footer">
            <button class="btn-secondary modal-close">Tutup</button>
        </div>
    `;
    
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    
    // Add close functionality
    const closeButtons = modalOverlay.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            document.body.style.overflow = 'auto';
        });
    });
    
    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
            document.body.style.overflow = 'auto';
        }
    });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => {
        modalOverlay.classList.add('show');
    }, 100);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation
    document.body.classList.add('loaded');
    
    // Initialize tooltips or other components if needed
    console.log('Register page initialized successfully');
    
    // Check for saved form data (if any)
    const savedData = getSavedFormData();
    if (savedData) {
        populateForm(savedData);
    }
});

// Save form data to local storage (optional)
function saveFormData() {
    const formData = {
        nama: document.getElementById('nama').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value
        // Don't save password for security
    };
    
    try {
        localStorage.setItem('registerFormData', JSON.stringify(formData));
    } catch (e) {
        console.warn('Could not save form data to localStorage');
    }
}

// Get saved form data
function getSavedFormData() {
    try {
        const saved = localStorage.getItem('registerFormData');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.warn('Could not retrieve saved form data');
        return null;
    }
}

// Populate form with saved data
function populateForm(data) {
    if (data.nama) document.getElementById('nama').value = data.nama;
    if (data.username) document.getElementById('username').value = data.username;
    if (data.email) document.getElementById('email').value = data.email;
}

// Save form data on input (debounced)
let saveTimeout;
formInputs.forEach(input => {
    if (input.type !== 'password' && input.type !== 'file') {
        input.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveFormData, 1000);
        });
    }
});

// Clear saved data on successful registration
registerForm.addEventListener('submit', () => {
    try {
        localStorage.removeItem('registerFormData');
    } catch (e) {
        console.warn('Could not clear saved form data');
    }
});