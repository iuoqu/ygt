// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add CSS for mobile menu
    const style = document.createElement('style');
    style.textContent = `
        .nav-menu {
            transition: all 0.3s ease;
        }
        
        @media (max-width: 768px) {
            .nav-menu {
                position: fixed;
                top: 70px;
                left: -100%;
                width: 100%;
                height: calc(100vh - 70px);
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                padding-top: 2rem;
                transition: left 0.3s ease;
            }
            
            .nav-menu.active {
                left: 0;
            }
            
            .nav-menu li {
                margin: 1rem 0;
            }
            
            .hamburger.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .hamburger.active span:nth-child(2) {
                opacity: 0;
            }
            
            .hamburger.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -6px);
            }
        }
        
        .header {
            transition: transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.experience-card, .review-card, .product-item, .contact-item, .location-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Gallery image lazy loading
    const galleryImages = document.querySelectorAll('.gallery-item img');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transform = 'scale(0.9)';
                
                // Simulate image loading
                setTimeout(() => {
                    img.style.opacity = '1';
                    img.style.transform = 'scale(1)';
                }, 200);
                
                imageObserver.unobserve(img);
            }
        });
    }, { threshold: 0.1 });
    
    galleryImages.forEach(img => {
        img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        imageObserver.observe(img);
    });
    
    // Special offer countdown timer
    const offerExpiry = new Date('2024-12-31').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = offerExpiry - now;
        
        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            const countdownElement = document.querySelector('.offer-card em');
            if (countdownElement) {
                countdownElement.textContent = `Valid once per person. Expires: ${days} days, ${hours} hours`;
            }
        }
    }
    
    // Update countdown every hour
    updateCountdown();
    setInterval(updateCountdown, 3600000);

    // Monthly rotating QR (client-side, simple)
    (function setMonthlyQr() {
        const img = document.getElementById('offer-qr');
        if (!img) return;
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const code = `YGT-${year}${month}`; // human-readable monthly code
        const url = `https://yugardentea.com/offer?m=${year}${month}&c=${code}`;
        const api = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=';
        img.src = api + encodeURIComponent(url);
        const label = document.querySelector('.offer-card em');
        if (label) label.textContent = `Valid once per person. Month: ${year}-${month}`;
        const codeEl = document.getElementById('offer-code');
        if (codeEl) codeEl.textContent = `Code: ${code}`;
    })();
    
    // Form validation for booking (if form exists)
    const bookingForm = document.querySelector('#booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const name = this.querySelector('input[name="name"]').value;
            const email = this.querySelector('input[name="email"]').value;
            const date = this.querySelector('input[name="date"]').value;
            
            if (!name || !email || !date) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Simulate form submission
            alert('Thank you for your booking request! We will contact you soon to confirm your tea tasting session.');
            this.reset();
        });
    }
    
    // QR code generation (placeholder)
    function generateQRCode(text, elementId) {
        // This is a placeholder - in a real implementation, you'd use a QR code library
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div style="width: 150px; height: 150px; background: #f0f0f0; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                    <span style="color: #666; font-size: 12px;">QR Code</span>
                </div>
            `;
        }
    }
    
    // Generate QR codes for special offer and WeChat
    generateQRCode('https://yugardentea.com/special-offer', 'qr-code');
    
    // Add loading states
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('btn-secondary')) {
                this.classList.add('loading');
                this.textContent = 'Loading...';
                
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.textContent = this.getAttribute('data-original-text') || this.textContent;
                }, 2000);
            }
        });
    });
    
    // Store original button text
    buttons.forEach(button => {
        button.setAttribute('data-original-text', button.textContent);
    });
    
    // Add CSS for loading state
    const loadingStyle = document.createElement('style');
    loadingStyle.textContent = `
        .btn.loading {
            opacity: 0.7;
            pointer-events: none;
        }
    `;
    document.head.appendChild(loadingStyle);
    
    // Analytics tracking (placeholder)
    function trackEvent(eventName, eventData) {
        // This would integrate with Google Analytics or similar
        console.log('Event tracked:', eventName, eventData);
    }
    
    // Track page views and interactions
    trackEvent('page_view', { page: 'home' });
    
    // Track button clicks
    const trackableButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    trackableButtons.forEach(button => {
        button.addEventListener('click', function() {
            trackEvent('button_click', { 
                button_text: this.textContent.trim(),
                button_type: this.classList.contains('btn-primary') ? 'primary' : 'secondary'
            });
        });
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', function() {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            if (maxScrollDepth % 25 === 0) { // Track every 25%
                trackEvent('scroll_depth', { depth: maxScrollDepth });
            }
        }
    });
});

