document.addEventListener('DOMContentLoaded', function() {
    // Calculate responsive values based on viewport
    function getResponsiveValue(min, preferred, max) {
        return Math.min(Math.max(min, preferred), max);
    }
    
    // Helper function to calculate viewport-relative values
    function vwToPx(vw) {
        return (window.innerWidth * vw) / 100;
    }
    
    function vhToPx(vh) {
        return (window.innerHeight * vh) / 100;
    }
    
    // Smooth scrolling for navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn, .dot-nav-btn, .logo-btn');
    const navbar = document.querySelector('.navbar');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-section');
            const targetSection = document.getElementById(targetId);
            
            // Get navbar height for accurate scrolling with fixed header
            const navbarHeight = navbar.offsetHeight;
            
            // Calculate a responsive offset based on viewport size
            const responsiveOffset = getResponsiveValue(10, vhToPx(2), 50);
            
            window.scrollTo({
                top: targetSection.offsetTop - navbarHeight - responsiveOffset,
                behavior: 'smooth'
            });
        });
    });
    
    // Add active class to current section's nav button
    const sections = document.querySelectorAll('.section');
    
    function updateActiveSection() {
        const navbarHeight = navbar.offsetHeight;
        const viewportHeight = window.innerHeight;
        let current = '';
    
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Use a percentage of viewport height for threshold
            const threshold = getResponsiveValue(0.1, 0.25, 0.5) * viewportHeight;
    
            if (window.scrollY >= (sectionTop - navbarHeight - threshold)) {
                current = section.getAttribute('id');
            }
        });
    
        // Update regular nav buttons
        document.querySelectorAll('.nav-btn').forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-section') === current) {
                button.classList.add('active');
                // Apply the accent color (for example, using a CSS variable --accent-color)
                button.style.backgroundColor = 'var(--accent-color)'; // Replace with your accent color
                button.style.color = '#fff'; // Assuming the text should be white when the button is active
            } else {
                // Reset the background and text color for inactive buttons
                button.style.backgroundColor = ''; // Reset to default
                button.style.color = ''; // Reset to default
            }
    
            // Hide nav buttons when not on first section
            if (current === 'section1') {
                button.classList.remove('hidden');
            } else {
                button.classList.add('hidden');
            }        
            
            const langButton = document.querySelector('.language-btn');

if (langButton) {
    if (current === 'section1') {
        langButton.classList.remove('hidden');
        langButton.setAttribute('aria-hidden', 'false');
    } else {
        langButton.classList.add('hidden');
        langButton.setAttribute('aria-hidden', 'true');
    }
}
        });
    
        // Update dot nav buttons and handle section name visibility
        document.querySelectorAll('.dot-nav-btn').forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-section') === current) {
                button.classList.add('active');
                // Show section name immediately when section becomes active
                const sectionName = button.parentElement.querySelector('.section-name');
                if (sectionName) {
                    sectionName.style.opacity = '1';
                    sectionName.style.transform = 'translateX(0)';
                    sectionName.style.visibility = 'visible';
    
                    // Hide section name after 1 second
                    setTimeout(() => {
                        sectionName.style.opacity = '0';
                        sectionName.style.transform = 'translateX(10px)';
                        sectionName.style.visibility = 'hidden';
                    }, 1000);
                }
            }
        });
    
        // Toggle visibility of dot navbar based on current section
        const dotNavbar = document.querySelector('.dot-navbar');
        if (dotNavbar) {
            if (current === 'section1') {
                dotNavbar.classList.add('hidden');
            } else {
                dotNavbar.classList.remove('hidden');
            }
        }
    }
    
    
    // Initial call to set active state correctly on page load
    updateActiveSection();
    
    // Add throttling to scroll event to improve performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        scrollTimeout = window.requestAnimationFrame(function() {
            updateActiveSection();
        });
    });
    
    // Update on resize to handle responsive changes
    let resizeTimeout;
    window.addEventListener('resize', function() {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(updateActiveSection, 100);
    });
    
    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formValues = Object.fromEntries(formData.entries());
            
            // Simple validation
            if (!formValues.name || !formValues.email || !formValues.message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Here you would normally send the data to a server
            console.log('Form data:', formValues);
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset the form
            this.reset();
        });
    }
    
    // Create a logo placeholder if no logo image is found
    const logoImg = document.querySelector('.logo img');
    if (logoImg) {
        logoImg.addEventListener('error', function() {
            const logoDiv = this.parentElement;
            this.remove();
            
            // Create text logo as fallback
            const textLogo = document.createElement('h1');
            textLogo.textContent = 'LOGO';
            textLogo.style.color = 'white';
            // Use responsive font size
            textLogo.style.fontSize = 'clamp(1.2rem, 3vw, 1.5rem)';
            logoDiv.appendChild(textLogo);
        });
    }
    
    // Add a lightweight parallax effect that works well with responsive design
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const scrollPosition = window.scrollY;
                const viewportHeight = window.innerHeight;
                // Calculate responsive parallax speed
                const parallaxSpeed = getResponsiveValue(0.02, 0.05, 0.1);
                
                // Use both percentage and pixel values for better responsiveness
                document.body.style.backgroundPositionY = `calc(50% + ${scrollPosition * parallaxSpeed}px)`;
                ticking = false;
            });
            ticking = true;
        }
    });

    // Add hover event listeners for dot navigation
    document.querySelectorAll('.dot-nav-btn').forEach(button => {
        const sectionName = button.parentElement.querySelector('.section-name');
        
        button.addEventListener('mouseenter', function() {
            if (sectionName) {
                sectionName.style.opacity = '1';
                sectionName.style.transform = 'translateX(0)';
                sectionName.style.visibility = 'visible';
            }
        });

        button.addEventListener('mouseleave', function() {
            if (sectionName && !button.classList.contains('active')) {
                sectionName.style.opacity = '0';
                sectionName.style.transform = 'translateX(10px)';
                sectionName.style.visibility = 'hidden';
            }
        });
    });

    // Add image reveal effect to section 2 background
    const section2 = document.getElementById('section2');
    if (section2) {
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    const scrolled = window.scrollY;
                    const section2Top = section2.getBoundingClientRect().top + window.scrollY;
                    const section2Height = section2.offsetHeight;
                    const viewportHeight = window.innerHeight;
                    
                    // Calculate how far through the section we've scrolled (0 to 1)
                    const progress = (scrolled - section2Top) / section2Height;
                    
                    // Calculate how much of the section is visible
                    const sectionBottom = section2Top + section2Height;
                    const visibleHeight = Math.min(sectionBottom, scrolled + viewportHeight) - Math.max(section2Top, scrolled);
                    const visibilityProgress = visibleHeight / section2Height;
                    
                    // Only apply effect when section is in view
                    if (visibilityProgress > 0) {
                        // Calculate the background position based on both scroll progress and visibility
                        const backgroundPosition = 50 + (progress - 0.5) * 100;
                        section2.style.setProperty('--background-position', `${backgroundPosition}%`);
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Handle scroll arrow visibility
    const scrollArrow = document.getElementById('scroll-arrow');
    if (scrollArrow) {
        function updateScrollArrowVisibility() {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Show arrow if not at bottom (with a small threshold)
            if (scrollPosition + windowHeight < documentHeight - 100) {
                scrollArrow.style.opacity = '1';
                scrollArrow.style.pointerEvents = 'auto';
            } else {
                scrollArrow.style.opacity = '0';
                scrollArrow.style.pointerEvents = 'none';
            }
        }

        // Initial check
        updateScrollArrowVisibility();

        // Update on scroll
        window.addEventListener('scroll', updateScrollArrowVisibility);
    }

    window.addEventListener('scroll', () => {
        const speed = 5; // smaller = slower movement (experiment!)
    
        document.querySelectorAll('.parallax-img').forEach(container => {
          const img = container.querySelector('img');
          const rect = container.getBoundingClientRect();
          const windowHeight = window.innerHeight;
    
          // How far the element is from the center of the screen
          const scrollProgress = (rect.top + rect.height / 2 - windowHeight / 2) / windowHeight;
    
          // Parallax effect: negative = move up when scrolling down
          const offset = scrollProgress * 20 * speed;
    
          img.style.setProperty('--scroll-offset', `${offset}px`);
        });
      });

      const langToggle = document.getElementById('lang-toggle');
const flagImg = langToggle.querySelector('img');
let currentLang = 'en';

// Function to update all elements with data-lang attributes
function updateLanguage(lang) {
  document.documentElement.lang = lang;
  currentLang = lang;
  
  // Update text content of elements based on data-lang
  document.querySelectorAll('[data-en], [data-ro]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
  
  // Update the flag based on language
  flagImg.src = lang === 'en' ? 'res/icons/en.png' : 'res/icons/ro.png';
  flagImg.alt = lang === 'en' ? 'English flag' : 'Romanian flag';
}

// Language toggle button
langToggle.addEventListener('click', () => {
  const newLang = currentLang === 'en' ? 'ro' : 'en';
  updateLanguage(newLang);
});

// GeoIP-based language detection
fetch('https://ipapi.co/json')
  .then(response => response.json())
  .then(data => {
    if (data.country_code === 'RO') {
      updateLanguage('ro');
    } else {
      updateLanguage('en');
    }
  })
  .catch(() => {
    // fallback to English if geolocation fails
    updateLanguage('en');
  });


      let lastScrollY = window.scrollY;
      const toggleButton = document.getElementById('lang-toggle');
      
      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
      
        if (currentScrollY - lastScrollY > 10) {
            // Scrolling down → hide
            themeToggle.classList.add('hidden');
            toggleButton.classList.add('hidden');
        } else if (lastScrollY - currentScrollY > 10) {
            // Scrolling up → show
            themeToggle.classList.remove('hidden');
            toggleButton.classList.remove('hidden');
        }
      
        lastScrollY = currentScrollY;
    });


      const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Function to set theme
    function setTheme(isDark) {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(isDark ? 'dark-mode' : 'light-mode');
        localStorage.setItem('darkMode', isDark);
    }

    // Check for system preference and stored preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('darkMode');
    
    // Set initial theme
    if (storedTheme !== null) {
        setTheme(storedTheme === 'true');
    } else {
        setTheme(prefersDark);
    }

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        setTheme(!document.body.classList.contains('dark-mode'));
    });

    // Handle system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('darkMode') === null) {
            setTheme(e.matches);
        }
    });

});