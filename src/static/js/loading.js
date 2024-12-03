const LoadingManager = {
    init() {
        this.setupLoadingStates();
    },

    setupLoadingStates() {
        // Add loading state to video cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    observer.unobserve(entry.target);
                }
            });
        });

        document.querySelectorAll('.video-card').forEach(card => {
            observer.observe(card);
        });
    },

    showSkeletonLoader() {
        const skeleton = `
            <div class="skeleton-card">
                <div class="skeleton-thumbnail"></div>
                <div class="skeleton-info">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-meta"></div>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.className = 'skeleton-container';
        container.innerHTML = skeleton.repeat(6);
        
        return container;
    }
}; 