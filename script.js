// ================================
// INIT
// ================================
document.addEventListener('DOMContentLoaded', function () {
    initCustomCursor();
    initThemeToggle();
    initParticlesBackground();
    initMobileMenu();
    initSmoothScrolling();
    initHeaderScroll();
    initActiveNavigation();
    initScrollAnimations();
    initTypingEffect();
    initSkillBars();
    initBackToTop();
    initContactForm();
    setCurrentYear();
});

// ================================
// CUSTOM CURSOR
// ================================
function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    if (!cursor || !follower) return;

    let mx = 0, my = 0;
    let cx = 0, cy = 0;
    let fx = 0, fy = 0;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    function animateCursor() {
        cx += (mx - cx) * 0.9;
        cy += (my - cy) * 0.9;
        fx += (mx - fx) * 0.12;
        fy += (my - fy) * 0.12;

        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
        follower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, .btn, .project-card, .skill-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform += ' scale(1.5)';
            follower.style.width = '52px';
            follower.style.height = '52px';
            follower.style.opacity = '0.25';
        });
        el.addEventListener('mouseleave', () => {
            follower.style.width = '36px';
            follower.style.height = '36px';
            follower.style.opacity = '0.45';
        });
    });
}

// ================================
// THEME TOGGLE
// ================================
function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    // Apply saved theme (also done inline in HTML, but belt-and-suspenders)
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);

        // Brief scale animation
        btn.style.transform = 'scale(0.82)';
        setTimeout(() => { btn.style.transform = ''; }, 180);
    });
}

// ================================
// PARTICLES BACKGROUND
// ================================
function initParticlesBackground() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Size canvas to window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
    });

    // Track mouse
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Get particle color based on current theme
    function getParticleColor() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark ? { r: 139, g: 120, b: 255 } : { r: 99, g: 91, b: 255 };
    }

    // Particle class
    class Particle {
        constructor() {
            this.init();
        }
        init() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.8;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.baseOpacity = Math.random() * 0.4 + 0.15;
            this.opacity = this.baseOpacity;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse repulsion
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const force = (100 - dist) / 100;
                this.x -= (dx / dist) * force * 1.8;
                this.y -= (dy / dist) * force * 1.8;
            }

            // Wrap edges
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        draw(c) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles
    function createParticles() {
        const count = window.innerWidth > 768 ? 100 : 50;
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    // Draw connecting lines
    function connectParticles(c) {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.35;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const c = getParticleColor();
        particles.forEach(p => {
            p.update();
            p.draw(c);
        });
        connectParticles(c);
        requestAnimationFrame(animate);
    }

    createParticles();
    animate();
}

// ================================
// HEADER SCROLL EFFECT
// ================================
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    function onScroll() {
        if (window.pageYOffset > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
}

// ================================
// MOBILE MENU
// ================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        nav.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            toggle.classList.remove('active');
            nav.classList.remove('active');
        }
    });
}

// ================================
// SMOOTH SCROLLING
// ================================
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ================================
// ACTIVE NAVIGATION
// ================================
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActive() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const top = section.offsetTop - 120;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < bottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
}

// ================================
// SCROLL ANIMATIONS
// ================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.07,
        rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('[data-aos]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        const delay = el.getAttribute('data-aos-delay');
        if (delay) el.style.transitionDelay = `${delay}ms`;
        observer.observe(el);
    });
}

// ================================
// TYPING EFFECT
// ================================
function initTypingEffect() {
    const el = document.querySelector('.typing-text');
    if (!el) return;

    const texts = [
        'WordPress & Elementor Designer',
        'Frontend Web Developer',
        'SEO Specialist',
        'Content Creator'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const current = texts[textIndex];

        if (isDeleting) {
            el.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            el.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === current.length) {
            typingSpeed = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 400;
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 900);
}

// ================================
// SKILL BARS
// ================================
function initSkillBars() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.getAttribute('data-progress');
                entry.target.style.width = progress + '%';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.skill-progress').forEach(bar => observer.observe(bar));
}

// ================================
// BACK TO TOP
// ================================
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ================================
// CONTACT FORM
// ================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    if (!form) return;

    // Float labels on select fields when a value is chosen
    form.querySelectorAll('select').forEach(select => {
        function updateSelectLabel() {
            const label = select.nextElementSibling;
            if (!label || label.tagName !== 'LABEL') return;
            if (select.value && select.value !== '') {
                label.classList.add('floated');
            } else {
                label.classList.remove('floated');
            }
        }
        select.addEventListener('change', updateSelectLabel);
        updateSelectLabel();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-circle-notch fa-spin"></i>';
        submitBtn.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formMessage.textContent = "Message sent! I'll get back to you within 24 hours.";
                formMessage.className = 'form-message success';
                form.reset();
                // Reset select labels
                form.querySelectorAll('select').forEach(s => {
                    const l = s.nextElementSibling;
                    if (l && l.tagName === 'LABEL') l.classList.remove('floated');
                });
            } else {
                throw new Error('Send failed');
            }
        } catch {
            formMessage.textContent = 'Something went wrong. Please try again or email me directly.';
            formMessage.className = 'form-message error';
        } finally {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            setTimeout(() => {
                formMessage.className = 'form-message';
                formMessage.textContent = '';
            }, 6000);
        }
    });
}

// ================================
// CURRENT YEAR
// ================================
function setCurrentYear() {
    const el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
}