let currentPage = 1;
let isLoading = false;
let hasMore = true;
let currentQuery = '';
let currentSort = 'relevance';
let currentDuration = 'any';
const resultsDiv = document.getElementById('results');
let loadMoreButton = null;

// Welcome screen and tutorial
const tutorialSteps = [
    {
        target: '.quick-search-grid',
        title: 'Quick Search',
        content: 'Use these buttons to quickly find ideas for common items',
        position: 'bottom'
    },
    {
        target: '.search-section input',
        title: 'Search Anything',
        content: 'Or search for any item you want to reuse',
        position: 'bottom'
    },
    {
        target: '.filter-controls',
        title: 'Filter Results',
        content: 'Sort and filter results to find exactly what you need',
        position: 'top'
    }
];

function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Discovering Ideas</div>
        <div class="loading-progress"></div>
    `;
    
    // Add random inspirational messages
    const messages = [
        'Discovering Ideas',
        'Finding Inspiration',
        'Exploring Creativity',
        'Uncovering Solutions',
        'Searching for Magic'
    ];
    
    const loadingText = loader.querySelector('.loading-text');
    let messageIndex = 0;
    
    // Change message every 2 seconds
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        loadingText.textContent = messages[messageIndex];
    }, 2000);
    
    // Store interval ID for cleanup
    loader.dataset.messageInterval = messageInterval;
    
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.loading-overlay');
    if (loader) {
        // Clear message interval
        clearInterval(loader.dataset.messageInterval);
        // Add fade out animation
        loader.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => loader.remove(), 300);
    }
}

async function searchTutorials(event, isNewSearch = true) {
    if (event?.preventDefault) {
        event.preventDefault();
        currentQuery = event.target.q.value;
    } else if (typeof event === 'string') {
        currentQuery = event;
    }
    
    if (isNewSearch) {
        currentPage = 1;
        hasMore = true;
        resultsDiv.innerHTML = '';
        if (loadMoreButton) {
            loadMoreButton.remove();
            loadMoreButton = null;
        }
    }
    
    if (!hasMore || isLoading || !currentQuery) return;
    
    isLoading = true;
    showLoading();
    
    try {
        const response = await fetch(
            `/search?q=${encodeURIComponent(currentQuery)}&page=${currentPage}&sort=${currentSort}&duration=${currentDuration}`
        );
        const data = await response.json();
        
        if (data.error) {
            resultsDiv.innerHTML = `<div class="error-message">❌ ${data.error}</div>`;
            return;
        }
        
        resultsDiv.insertAdjacentHTML('beforeend', data.items.map(video => `
            <div class="video-card" onclick="playVideo('${video.id}')">
                <div class="thumbnail-container">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <div class="play-overlay">
                        <div class="play-icon">▶</div>
                    </div>
                    ${video.duration ? `<span class="duration">${video.duration}</span>` : ''}
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    ${video.views ? `<div class="video-meta">${video.views}</div>` : ''}
                    ${video.description ? `
                        <p class="video-description">${video.description.substring(0, 100)}${video.description.length > 100 ? '...' : ''}</p>
                    ` : ''}
                </div>
            </div>
        `).join(''));
        
        hasMore = data.hasMore;
        currentPage = data.nextPage;
        
        if (hasMore) {
            if (!loadMoreButton) {
                loadMoreButton = document.createElement('button');
                loadMoreButton.className = 'load-more-button';
                loadMoreButton.onclick = () => searchTutorials(null, false);
            }
            loadMoreButton.innerHTML = 'Show More Results';
            loadMoreButton.disabled = false;
            resultsDiv.after(loadMoreButton);
        } else if (loadMoreButton) {
            loadMoreButton.remove();
            loadMoreButton = null;
        }
        
        if (isNewSearch && resultsDiv.children.length > 0) {
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
    } catch (error) {
        resultsDiv.innerHTML = '<div class="error-message">❌ Error loading results</div>';
        console.error(error);
    } finally {
        isLoading = false;
        hideLoading();
    }
}

function quickSearch(term) {
    searchTutorials(term, true);
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

function playVideo(videoId) {
    if (!videoId) {
        console.error('No video ID provided');
        return;
    }

    // Create modal if it doesn't exist
    let modal = document.querySelector('.video-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'video-modal';
        document.body.appendChild(modal);
    }

    // Update modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
                ></iframe>
            </div>
            <button class="close-modal" aria-label="Close video">×</button>
        </div>
    `;

    // Show modal
    requestAnimationFrame(() => {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    });

    // Handle closing
    function closeModal() {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        // Remove iframe after animation
        setTimeout(() => {
            modal.querySelector('iframe').src = '';
        }, 300);
    }

    // Close on button click
    modal.querySelector('.close-modal').addEventListener('click', closeModal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// Welcome Screen Management
function initializeWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('start-tutorial');
    const skipButton = document.getElementById('skip-tutorial');
    const tutorialModal = document.querySelector('.tutorial-modal');

    // Only show welcome screen if tutorial hasn't been completed
    if (!localStorage.getItem('tutorialComplete')) {
        welcomeScreen.style.display = 'flex';

        // Start Tutorial Button
        startButton.onclick = function() {
            welcomeScreen.style.display = 'none';
            startTutorial();
        };

        // Skip Tutorial Button
        skipButton.onclick = function() {
            welcomeScreen.style.display = 'none';
            localStorage.setItem('tutorialComplete', 'true');
        };
    } else {
        welcomeScreen.style.display = 'none';
    }
}

// Tutorial Management
function startTutorial() {
    const modal = document.querySelector('.tutorial-modal');
    const slides = document.querySelectorAll('.tutorial-slide');
    const nextBtn = document.querySelector('.tutorial-next');
    const skipBtn = document.querySelector('.tutorial-skip');
    const progressDots = document.querySelector('.progress-dots');
    let currentStep = 1;
    const totalSteps = 3;

    // Create progress dots
    progressDots.innerHTML = '';
    for (let i = 0; i < totalSteps; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        progressDots.appendChild(dot);
    }

    // Show first slide
    slides.forEach(slide => slide.classList.remove('active'));
    slides[0].classList.add('active');

    // Show tutorial
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('visible'), 100);

    // Next button handler
    nextBtn.onclick = function() {
        if (currentStep === totalSteps) {
            endTutorial();
            return;
        }

        // Hide current slide
        slides[currentStep - 1].classList.remove('active');
        progressDots.children[currentStep - 1].classList.remove('active');

        // Show next slide
        currentStep++;
        slides[currentStep - 1].classList.add('active');
        progressDots.children[currentStep - 1].classList.add('active');

        // Update button text on last slide
        if (currentStep === totalSteps) {
            nextBtn.textContent = 'Get Started';
        }
    };

    // Skip button handler
    skipBtn.onclick = endTutorial;
}

function endTutorial() {
    const modal = document.querySelector('.tutorial-modal');
    modal.classList.remove('visible');
    setTimeout(() => {
        modal.classList.add('hidden');
        localStorage.setItem('tutorialComplete', 'true');
    }, 300);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    setupHeaderAnimation();
    
    // Skip welcome screen and tutorial
    localStorage.setItem('tutorialComplete', 'true');
    
    // Hide welcome screen if it exists
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }

    const splashScreen = document.querySelector('.splash-screen');
    
    // Hide splash screen after animations
    setTimeout(() => {
        splashScreen.classList.add('fade-out');
        // Remove from DOM after fade
        setTimeout(() => {
            splashScreen.remove();
        }, 500);
    }, 2500);
});

function setupHeaderAnimation() {
    const words = document.querySelectorAll('.words span');
    let currentIndex = 0;

    function showNextWord() {
        words.forEach(word => {
            word.classList.remove('active');
            word.style.transitionDelay = '0s';
        });
        
        words[currentIndex].classList.add('active');
        words[currentIndex].style.transitionDelay = '0.3s';
        
        currentIndex = (currentIndex + 1) % words.length;
    }

    showNextWord();
    setInterval(showNextWord, 3000);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const body = document.body;
    
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        // Close sidebar when clicking overlay
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Toggle states
    const isOpen = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen);
    menuToggle.classList.toggle('active');
    body.classList.toggle('sidebar-open');
    
    // Trap focus within sidebar when open
    if (isOpen) {
        trapFocus(sidebar);
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const body = document.body;
    
    sidebar.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('active');
    body.classList.remove('sidebar-open');
}

// Focus trap for accessibility
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    firstFocusable.focus();
    
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });
}

// Close sidebar on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSidebar();
    }
});

// Add error handling for window reference
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        console.warn('Error caught:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.warn('Promise rejection:', event.reason);
    });
}