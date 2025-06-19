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

// Profile page specific JavaScript
class ProfileManager {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadProfileData();
    }

    initializeElements() {
        this.form = document.getElementById('profileUpdateForm');
        this.avatarEdit = document.getElementById('profileAvatarEdit');
        this.imageInput = document.getElementById('profileImageInput');
        this.mainAvatar = document.getElementById('profileMainAvatar');
        this.successMessage = document.getElementById('profileSuccessMessage');
        this.cancelBtn = document.getElementById('profileCancelBtn');
        this.originalData = {};
    }

    bindEvents() {
        // Avatar edit functionality
        this.avatarEdit.addEventListener('click', () => {
            this.imageInput.click();
        });

        // Image upload handler
        this.imageInput.addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel button
        this.cancelBtn.addEventListener('click', () => {
            this.resetForm();
        });

        // Auto-save on input change (debounced)
        this.setupAutoSave();

        // Phone number formatting
        const phoneInput = document.getElementById('profileTelepon');
        if (phoneInput) {
            phoneInput.addEventListener('input', this.formatPhoneNumber);
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
            this.showNotification('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.', 'error');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Ukuran file terlalu besar. Maksimal 5MB.', 'error');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.mainAvatar.src = e.target.result;
            this.showNotification('Foto profil berhasil diperbarui!', 'success');
        };
        reader.readAsDataURL(file);
    }

    handleFormSubmit() {
        const formData = new FormData(this.form);
        const profileData = Object.fromEntries(formData.entries());

        // Validate required fields
        if (!this.validateForm(profileData)) {
            return;
        }

        // Show loading state
        const submitBtn = this.form.querySelector('.profile-btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Menyimpan...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            this.saveProfile(profileData);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    validateForm(data) {
        const errors = [];

        if (!data.nama.trim()) errors.push('Nama harus diisi');
        if (!data.email.trim()) errors.push('Email harus diisi');
        if (!this.isValidEmail(data.email)) errors.push('Format email tidak valid');
        if (!data.username.trim()) errors.push('Username harus diisi');
        if (data.username.length < 3) errors.push('Username minimal 3 karakter');

        if (errors.length > 0) {
            this.showNotification('Terdapat kesalahan:\n' + errors.join('\n'), 'error');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    saveProfile(data) {
        // Store original data for reset functionality
        this.originalData = { ...data };

        // Show success message
        this.successMessage.classList.add('show');
        setTimeout(() => {
            this.successMessage.classList.remove('show');
        }, 5000);

        // Update page title with new name
        const brandText = document.querySelector('.profile-brand-text');
        if (brandText && data.nama !== brandText.textContent.replace('Halo, ', '')) {
            brandText.textContent = `Halo, ${data.nama}`;
        }

        this.showNotification('Profil berhasil diperbarui!', 'success');
    }

    resetForm() {
        if (Object.keys(this.originalData).length > 0) {
            Object.keys(this.originalData).forEach(key => {
                const input = this.form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = this.originalData[key];
                }
            });
            this.showNotification('Perubahan dibatalkan', 'info');
        }
    }

    loadProfileData() {
        // Store initial form data as original data
        const formData = new FormData(this.form);
        this.originalData = Object.fromEntries(formData.entries());
    }

    setupAutoSave() {
        let autoSaveTimeout;
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    this.autoSaveProfile();
                }, 2000);
            });
        });
    }

    autoSaveProfile() {
        // Only auto-save if there are changes
        const currentData = Object.fromEntries(new FormData(this.form).entries());
        const hasChanges = Object.keys(currentData).some(key => 
            currentData[key] !== this.originalData[key]
        );

        if (hasChanges) {
            console.log('Auto-saving profile changes...');
            // Here you would typically send the data to your backend
            // Example API call:
            // this.sendToAPI(currentData);
        }
    }

    formatPhoneNumber(event) {
        let value = event.target.value.replace(/\D/g, '');
        
        // Indonesian phone number formatting
        if (value.startsWith('62')) {
            value = value.substring(2);
        }
        if (value.startsWith('0')) {
            value = value.substring(1);
        }
        
        // Add formatting
        if (value.length > 0) {
            value = '0' + value;
            if (value.length > 4) {
                value = value.substring(0, 4) + '-' + value.substring(4);
            }
            if (value.length > 9) {
                value = value.substring(0, 9) + '-' + value.substring(9);
            }
            if (value.length > 14) {
                value = value.substring(0, 14);
            }
        }
        
        event.target.value = value;
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.profile-notification').forEach(n => n.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `profile-notification profile-notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            padding: 15px 20px;
            border-radius: 8px;
            max-width: 350px;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                <span>${message.replace(/\n/g, '<br>')}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer; opacity: 0.7; padding: 0; line-height: 1;">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // Additional utility methods
    sendToAPI(data) {
        // Example API integration
        return fetch('/api/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                this.showNotification('Profil berhasil disimpan!', 'success');
            } else {
                this.showNotification('Gagal menyimpan profil: ' + result.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.showNotification('Terjadi kesalahan saat menyimpan profil', 'error');
        });
    }

    // Password strength checker (if needed)
    checkPasswordStrength(password) {
        const strength = {
            score: 0,
            feedback: []
        };

        if (password.length >= 8) strength.score++;
        else strength.feedback.push('Minimal 8 karakter');

        if (/[a-z]/.test(password)) strength.score++;
        else strength.feedback.push('Harus mengandung huruf kecil');

        if (/[A-Z]/.test(password)) strength.score++;
        else strength.feedback.push('Harus mengandung huruf besar');

        if (/[0-9]/.test(password)) strength.score++;
        else strength.feedback.push('Harus mengandung angka');

        if (/[^A-Za-z0-9]/.test(password)) strength.score++;
        else strength.feedback.push('Harus mengandung karakter khusus');

        return strength;
    }

    // Cleanup method
    destroy() {
        // Remove event listeners and clean up
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.removeEventListener('input', this.autoSaveProfile);
        });
        
        document.querySelectorAll('.profile-notification').forEach(n => n.remove());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a profile page
    if (document.getElementById('profileUpdateForm')) {
        window.profileManager = new ProfileManager();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileManager;
}