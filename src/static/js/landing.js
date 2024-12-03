// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Demo video modal
function playDemo() {
    const modal = document.getElementById('demo-modal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('visible'), 50);
}

// Close modal
document.querySelector('.close-modal').addEventListener('click', () => {
    const modal = document.getElementById('demo-modal');
    modal.classList.remove('visible');
    setTimeout(() => modal.classList.add('hidden'), 300);
});

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, {
    threshold: 0.1
});

// Observe elements
document.querySelectorAll('.feature-card, .impact-item').forEach(el => {
    observer.observe(el);
});

// Newsletter form
document.querySelector('.newsletter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    // Add newsletter subscription logic here
    alert('Thanks for subscribing!');
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            scrollObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and elements that should animate
document.querySelectorAll('.feature-card, .impact-item, .about-grid > *, .partners-grid > *').forEach(el => {
    el.classList.add('animate-on-scroll');
    scrollObserver.observe(el);
});

// Particle animation
const particleContainer = document.createElement('div');
particleContainer.className = 'particles';
document.querySelector('.hero').appendChild(particleContainer);

for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.setProperty('--delay', `${Math.random() * 5}s`);
    particle.style.setProperty('--size', `${Math.random() * 3 + 1}px`);
    particleContainer.appendChild(particle);
} 