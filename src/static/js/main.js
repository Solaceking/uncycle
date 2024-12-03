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

    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&enablejsapi=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                ></iframe>
            </div>
            <button class="close-modal">×</button>
        </div>
    `;

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.className === 'close-modal') {
            document.body.removeChild(modal);
        }
    });

    document.body.appendChild(modal);
}

document.addEventListener('DOMContentLoaded', () => {
    setupHeaderAnimation();
    showWelcomeScreen();
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
    sidebar.classList.toggle('open');
}

function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('start-tutorial');
    const skipButton = document.getElementById('skip-tutorial');
    
    startButton.addEventListener('click', () => {
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.remove();
            startTutorial();
        }, 500);
    });
    
    skipButton.addEventListener('click', () => {
        welcomeScreen.style.opacity = '0';
        setTimeout(() => welcomeScreen.remove(), 500);
    });
}

function startTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    let currentStep = 0;
    
    function showStep(index) {
        const step = tutorialSteps[index];
        const target = document.querySelector(step.target);
        const rect = target.getBoundingClientRect();
        
        overlay.innerHTML = `
            <div class="tutorial-step" data-step="${index + 1}">
                <div class="tutorial-highlight" style="
                    top: ${rect.top - 10}px;
                    left: ${rect.left - 10}px;
                    width: ${rect.width + 20}px;
                    height: ${rect.height + 20}px;
                "></div>
                <div class="tutorial-content" style="
                    top: ${step.position === 'bottom' ? rect.bottom + 20 : rect.top - 120}px;
                    left: ${rect.left}px;
                ">
                    <h3>${step.title}</h3>
                    <p>${step.content}</p>
                    <button class="tutorial-next">
                        ${index < tutorialSteps.length - 1 ? 'Next →' : 'Finish'}
                    </button>
                </div>
            </div>
        `;
        
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('visible'), 50);
        
        const nextButton = overlay.querySelector('.tutorial-next');
        nextButton.addEventListener('click', () => {
            if (index < tutorialSteps.length - 1) {
                showStep(index + 1);
            } else {
                overlay.classList.remove('visible');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            }
        });
    }
    
    showStep(0);
}