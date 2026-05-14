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
        toggleContainer: document.querySelector('.toggle-container'),
        whatsappWidget: document.querySelector('.whatsapp-widget')
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
                const response = await fetch(`/lang/${lang}.json`);
                const dict = await response.json();
                
                document.querySelectorAll('[data-i18n-key]').forEach(el => {
                    const key = el.getAttribute('data-i18n-key');
                    const value = key.split('.').reduce((o, i) => (o ? o[i] : undefined), dict);
                    if (value) {
                        if (el.hasAttribute('data-i18n-accent-first')) {
                            const words = value.split(' ');
                            if (words.length > 0) {
                                const firstWord = words.shift();
                                el.innerHTML = `<span class="accent">${firstWord}</span> ${words.join(' ')}`;
                            } else {
                                el.textContent = value;
                            }
                        } else if (el.hasAttribute('data-i18n-accent-two')) {
                            const words = value.split(' ');
                            if (words.length >= 2) {
                                const firstTwo = words.splice(0, 2).join(' ');
                                el.innerHTML = `<span class="accent">${firstTwo}</span> ${words.join(' ')}`;
                            } else {
                                el.innerHTML = `<span class="accent">${value}</span>`;
                            }
                        } else if (el.hasAttribute('data-i18n-accent-all')) {
                            el.innerHTML = `<span class="accent">${value}</span>`;
                        } else if (el.hasAttribute('data-i18n-accent-colon')) {
                            const parts = value.split(':');
                            if (parts.length > 1) {
                                const label = parts.shift();
                                el.innerHTML = `<span class="accent">${label}:</span>${parts.join(':')}`;
                            } else {
                                el.textContent = value;
                            }
                        } else {
                            el.textContent = value;
                        }
                    }
                });

                document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                    const key = el.getAttribute('data-i18n-placeholder');
                    const value = key.split('.').reduce((o, i) => (o ? o[i] : undefined), dict);
                    if (value) el.placeholder = value;
                });

                state.currentLang = lang;
                localStorage.setItem('lang', lang);
                document.documentElement.setAttribute('lang', lang);
                
                this.updateToggleIcon(lang);
                this.updateWhatsAppMessage(dict);
            } catch (error) {
                console.error('Failed to load language:', error);
            }
        },

        updateToggleIcon(lang) {
            const langIcon = ui.langToggle?.querySelector('img');
            if (langIcon) {
                langIcon.src = `/res/icons/${lang}.png`;
                langIcon.alt = lang === 'en' ? 'English flag' : 'Romanian flag';
            }
        },

        updateWhatsAppMessage(dict) {
            if (ui.whatsappWidget) {
                // Use dict.whatsapp_message if available, otherwise fallback to hardcoded translations
                const message = dict?.whatsapp_message || (state.currentLang === 'ro' 
                    ? "Salut B-Tech, sunt interesat de o soluție software pentru afacerea mea. Putem discuta?" 
                    : "Hi B-Tech, I'm interested in a software solution for my business. Can we talk?");
                
                const phoneNumber = "40733216828";
                const encodedMessage = encodeURIComponent(message);
                ui.whatsappWidget.href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            }
        },

        async getDictionary() {
            const response = await fetch(`/lang/${state.currentLang}.json`);
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
                // Highlight current page
                if (button.tagName === 'A' && !button.classList.contains('logo-btn') && !button.classList.contains('quote-btn')) {
                    const buttonHref = button.getAttribute('href');
                    if (buttonHref) {
                        const currentPath = window.location.pathname;
                        // Normalize paths for comparison
                        const normalizedBtnPath = buttonHref.startsWith('/') ? buttonHref : '/' + buttonHref;
                        const normalizedCurrentPath = currentPath === '/' ? '/home.html' : currentPath;

                        // Check for exact match or if current page is a sub-resource of the nav link
                        // (e.g. /portfolio/alydeea.html matches /portfolio.html)
                        const isExactMatch = normalizedCurrentPath.endsWith(normalizedBtnPath);
                        const isParentMatch = normalizedBtnPath !== '/home.html' && normalizedCurrentPath.includes(normalizedBtnPath.replace('.html', ''));

                        if (isExactMatch || isParentMatch) {
                            button.classList.add('current-page');
                        }
                    }
                }

                button.addEventListener('click', (e) => {
                    const targetId = button.getAttribute('data-section');
                    if (!targetId) return; // For <a> links without data-section

                    const target = document.getElementById(targetId);
                    if (!target) {
                        // If target not on this page, let the default behavior happen (for <a>)
                        // or redirect to home.html#targetId (for <button>)
                        if (button.tagName === 'BUTTON') {
                            window.location.href = `home.html#${targetId}`;
                        }
                        return;
                    }

                    e.preventDefault();
                    this.scrollToSection(targetId);
                    
                    // GA4 Tracking for "Get a Quote"
                    if (button.classList.contains('quote-btn')) {
                        if (typeof gtag === 'function') {
                            gtag('event', 'click_get_quote', {
                                'event_category': 'Engagement',
                                'event_label': 'Header CTA'
                            });
                        }
                    }
                });
            });

            // Package CTAs
            document.querySelectorAll('.package-cta').forEach(button => {
                button.addEventListener('click', (e) => {
                    const targetId = button.getAttribute('data-section');
                    const pkg = button.getAttribute('data-package');
                    
                    const target = document.getElementById(targetId);
                    if (!target) {
                        window.location.href = `home.html?package=${pkg}#${targetId}`;
                        return;
                    }

                    // Pre-select package in form
                    const projectTypeSelect = document.getElementById('project_type');
                    if (projectTypeSelect) {
                        projectTypeSelect.value = pkg;
                    }

                    this.scrollToSection(targetId);

                    // GA4 Tracking for Package CTA
                    if (typeof gtag === 'function') {
                        gtag('event', 'click_package_cta', {
                            'package_type': pkg
                        });
                    }
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

            const allSections = document.querySelectorAll('.section');
            allSections.forEach(section => {
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
                
                // --- SEAMLESS PAGE TRANSITION LOGIC ---
                // If the user clicks a nav button that points to a section on ANOTHER page,
                // we should let the default link behavior happen (if it's an <a> tag).
                // But here we're updating active state based on scroll.
                
                if (!btn.classList.contains('quote-btn')) {
                    // Navbar buttons must always be visible
                    btn.classList.remove('hidden');
                }
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
                const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('home.html');
                ui.dotNavbar.classList.toggle('hidden', !isHomePage || current === 'section1');
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
                this.checkPreselectedPackage();
            }
        },

        checkPreselectedPackage() {
            const params = new URLSearchParams(window.location.search);
            const pkg = params.get('package');
            if (pkg) {
                const projectTypeSelect = document.getElementById('project_type');
                if (projectTypeSelect) {
                    projectTypeSelect.value = pkg;
                }
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
            if (!values.name || !values.email || !values.text || !values.project_type || !values.timeline) {
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
                    
                    // GA4 Tracking for successful form submission
                    if (typeof gtag === 'function') {
                        gtag('event', 'form_submission_success', {
                            'project_type': formData.get('project_type')
                        });
                    }

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