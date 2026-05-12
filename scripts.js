/**
 * BOBER TECHNOLOGIES - Main Application Script
 * Organized with a modular pattern for better maintainability.
 */

const BTechApp = (function() {
    // --- State & Configuration ---
    const state = {
        currentLang: localStorage.getItem('lang') || (navigator.language.startsWith('ro') ? 'ro' : 'en'),
        isDarkMode: localStorage.getItem('darkMode') === null 
            ? window.matchMedia('(prefers-color-scheme: dark)').matches 
            : localStorage.getItem('darkMode') === 'true',
        lastScrollY: window.scrollY,
        ticking: false
    };

    const config = {
        apiSubmitUrl: "https://api.web3forms.com/submit",
        navbarHeightOffset: 10,
        scrollThresholdFactor: 0.25,
        parallaxSpeed: 5
    };

    // --- Selectors ---
    const ui = {
        navbar: document.querySelector('.navbar'),
        navButtons: document.querySelectorAll('.nav-btn, .dot-nav-btn, .logo-btn'),
        dotNavbar: document.querySelector('.dot-navbar'),
        sections: document.querySelectorAll('.section'),
        themeToggle: document.getElementById('theme-toggle'),
        langToggle: document.getElementById('lang-toggle'),
        contactForm: document.getElementById('contact-form'),
        scrollArrow: document.getElementById('scroll-arrow'),
        parallaxImages: document.querySelectorAll('.parallax-img'),
        toggleContainer: document.querySelector('.toggle-container')
    };

    // --- Utilities ---
    const utils = {
        getResponsiveValue: (min, preferred, max) => Math.min(Math.max(min, preferred), max),
        vhToPx: (vh) => (window.innerHeight * vh) / 100,
        
        throttle: (callback) => {
            if (!state.ticking) {
                window.requestAnimationFrame(() => {
                    callback();
                    state.ticking = false;
                });
                state.ticking = true;
            }
        }
    };

    // --- Core Modules ---

    /**
     * Internationalization Module
     */
    const i18n = {
        async init() {
            await this.loadLanguage(state.currentLang);
        },

        async loadLanguage(lang) {
            try {
                const response = await fetch(`lang/${lang}.json`);
                const dict = await response.json();
                
                document.querySelectorAll('[data-i18n-key]').forEach(el => {
                    const key = el.getAttribute('data-i18n-key');
                    const value = key.split('.').reduce((o, i) => (o ? o[i] : undefined), dict);
                    if (value) el.textContent = value;
                });

                state.currentLang = lang;
                localStorage.setItem('lang', lang);
                document.documentElement.setAttribute('lang', lang);
                
                this.updateToggleIcon(lang);
            } catch (error) {
                console.error('Failed to load language:', error);
            }
        },

        updateToggleIcon(lang) {
            const langIcon = ui.langToggle?.querySelector('img');
            if (langIcon) {
                langIcon.src = `res/icons/${lang}.png`;
                langIcon.alt = lang === 'en' ? 'English flag' : 'Romanian flag';
            }
        },

        async getDictionary() {
            const response = await fetch(`lang/${state.currentLang}.json`);
            return await response.json();
        }
    };

    /**
     * Theme Module
     */
    const theme = {
        init() {
            this.applyTheme(state.isDarkMode);
            
            // System theme change listener
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (localStorage.getItem('darkMode') === null) {
                    this.applyTheme(e.matches);
                }
            });
        },

        applyTheme(isDark) {
            document.body.classList.remove('light-mode', 'dark-mode');
            document.body.classList.add(isDark ? 'dark-mode' : 'light-mode');
            state.isDarkMode = isDark;
            localStorage.setItem('darkMode', isDark);
        },

        toggle() {
            this.applyTheme(!state.isDarkMode);
        }
    };

    /**
     * Navigation & Scroll Module
     */
    const navigation = {
        init() {
            this.bindEvents();
            this.updateActiveSection();
            this.updateScrollArrow();
        },

        bindEvents() {
            ui.navButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = button.getAttribute('data-section');
                    this.scrollToSection(targetId);
                });
            });

            // Hover effects for dots
            document.querySelectorAll('.dot-nav-item').forEach(item => {
                const btn = item.querySelector('.dot-nav-btn');
                const name = item.querySelector('.section-name');
                
                item.addEventListener('mouseenter', () => {
                    if (name) {
                        name.style.opacity = '1';
                        name.style.transform = 'translateX(0)';
                        name.style.visibility = 'visible';
                    }
                });

                item.addEventListener('mouseleave', () => {
                    if (name && !btn.classList.contains('active')) {
                        name.style.opacity = '0';
                        name.style.transform = 'translateX(10px)';
                        name.style.visibility = 'hidden';
                    }
                });
            });
        },

        scrollToSection(id) {
            const target = document.getElementById(id);
            if (!target) return;

            const navbarHeight = ui.navbar ? ui.navbar.offsetHeight : 0;
            const responsiveOffset = utils.getResponsiveValue(10, utils.vhToPx(2), 50);

            window.scrollTo({
                top: target.offsetTop - navbarHeight - responsiveOffset,
                behavior: 'smooth'
            });
        },

        updateActiveSection() {
            const navbarHeight = ui.navbar ? ui.navbar.offsetHeight : 0;
            const viewportHeight = window.innerHeight;
            let current = '';

            ui.sections.forEach(section => {
                const threshold = utils.getResponsiveValue(0.1, config.scrollThresholdFactor, 0.5) * viewportHeight;
                if (window.scrollY >= (section.offsetTop - navbarHeight - threshold)) {
                    current = section.getAttribute('id');
                }
            });

            if (current) this.updateUIElements(current);
        },

        updateUIElements(current) {
            // Regular nav buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                const isMatch = btn.getAttribute('data-section') === current;
                btn.classList.toggle('active', isMatch);
                btn.classList.toggle('hidden', current !== 'section1');
            });

            // Dot nav
            document.querySelectorAll('.dot-nav-btn').forEach(btn => {
                const isMatch = btn.getAttribute('data-section') === current;
                btn.classList.toggle('active', isMatch);
                
                if (isMatch) {
                    const name = btn.parentElement.querySelector('.section-name');
                    if (name) {
                        name.style.opacity = '1';
                        name.style.transform = 'translateX(0)';
                        name.style.visibility = 'visible';
                        
                        // Clear existing timeout if any (simplified here)
                        setTimeout(() => {
                            if (btn.parentElement && !btn.parentElement.matches(':hover')) {
                                name.style.opacity = '0';
                                name.style.transform = 'translateX(10px)';
                                name.style.visibility = 'hidden';
                            }
                        }, 1500);
                    }
                }
            });

            if (ui.dotNavbar) {
                ui.dotNavbar.classList.toggle('hidden', current === 'section1');
            }
        },

        updateScrollArrow() {
            if (!ui.scrollArrow) return;
            const isBottom = (window.scrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 100);
            ui.scrollArrow.style.opacity = isBottom ? '0' : '1';
            ui.scrollArrow.style.pointerEvents = isBottom ? 'none' : 'auto';
        },

        handleScrollVisibility() {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - state.lastScrollY;

            if (Math.abs(delta) > 10) {
                const isScrollingDown = delta > 0;
                ui.themeToggle?.classList.toggle('hidden', isScrollingDown);
                ui.langToggle?.classList.toggle('hidden', isScrollingDown);
            }
            state.lastScrollY = currentScrollY;
        }
    };

    /**
     * Visual Effects Module
     */
    const effects = {
        init() {
            this.updateParallax();
        },

        updateParallax() {
            // Hero background parallax
            const scrollPosition = window.scrollY;
            const parallaxSpeed = utils.getResponsiveValue(0.02, 0.05, 0.1);
            document.body.style.backgroundPositionY = `calc(50% + ${scrollPosition * parallaxSpeed}px)`;

            // Section 4 images parallax
            ui.parallaxImages.forEach(container => {
                const img = container.querySelector('img');
                if (!img) return;
                
                const rect = container.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // Only calculate if visible
                if (rect.top < windowHeight && rect.bottom > 0) {
                    const scrollProgress = (rect.top + rect.height / 2 - windowHeight / 2) / windowHeight;
                    const offset = scrollProgress * 20 * config.parallaxSpeed;
                    img.style.setProperty('--scroll-offset', `${offset}px`);
                }
            });

            // Section 2 dynamic reveal
            const section2 = document.getElementById('section2');
            if (section2) {
                const rect = section2.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const progress = (window.scrollY - (section2.offsetTop)) / section2.offsetHeight;
                    section2.style.setProperty('--background-position', `${50 + (progress - 0.5) * 100}%`);
                }
            }
        }
    };

    /**
     * Form Module
     */
    const forms = {
        init() {
            if (ui.contactForm) {
                ui.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
            }
        },

        async handleSubmit(e) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const dict = await i18n.getDictionary();
            const status = dict.form_status || {};

            // Validation
            const values = Object.fromEntries(formData.entries());
            if (!values.name || !values.email || !values.text) {
                alert(status.validation_error || "Please fill in all required fields.");
                return;
            }

            try {
                const response = await fetch(config.apiSubmitUrl, {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    alert(status.success || "Message sent successfully!");
                    form.reset();
                } else {
                    alert((status.error || "Error: ") + (result.message || status.error_default || "Submission failed."));
                }
            } catch (error) {
                alert(status.network_error || "Network error. Please try again.");
            }
        }
    };

    // --- Public API ---
    return {
        init() {
            i18n.init();
            theme.init();
            navigation.init();
            effects.init();
            forms.init();

            // Global listeners
            window.addEventListener('scroll', () => {
                utils.throttle(() => {
                    navigation.updateActiveSection();
                    navigation.updateScrollArrow();
                    navigation.handleScrollVisibility();
                    effects.updateParallax();
                });
            });

            window.addEventListener('resize', () => {
                utils.throttle(() => {
                    navigation.updateActiveSection();
                });
            });

            ui.themeToggle?.addEventListener('click', () => theme.toggle());
            ui.langToggle?.addEventListener('click', () => i18n.loadLanguage(state.currentLang === 'en' ? 'ro' : 'en'));
            
            console.log('BTech App initialized');
        }
    };
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => BTechApp.init());