const KeyboardManager = {
    init() {
        this.setupKeyboardShortcuts();
        this.setupFocusManagement();
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.matches('input, textarea')) return;

            switch(e.key) {
                case '/':
                    // Focus search
                    e.preventDefault();
                    document.querySelector('.search-section input').focus();
                    break;

                case 'Escape':
                    // Close modals
                    this.closeActiveModal();
                    break;

                case 'ArrowLeft':
                    // Previous video
                    if (this.isVideoPlaying()) {
                        e.preventDefault();
                        this.seekVideo(-10);
                    }
                    break;

                case 'ArrowRight':
                    // Next video
                    if (this.isVideoPlaying()) {
                        e.preventDefault();
                        this.seekVideo(10);
                    }
                    break;

                case ' ':
                    // Play/Pause
                    if (this.isVideoPlaying()) {
                        e.preventDefault();
                        this.togglePlayPause();
                    }
                    break;
            }
        });
    },

    setupFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            const modal = document.querySelector('.modal.active');
            if (!modal) return;

            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

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
        });
    },

    isVideoPlaying() {
        return document.querySelector('.video-modal.active') !== null;
    },

    closeActiveModal() {
        const activeModal = document.querySelector('.modal.active, .share-modal.active, .video-modal.active');
        if (activeModal) {
            activeModal.querySelector('.close-modal').click();
        }
    },

    seekVideo(seconds) {
        const iframe = document.querySelector('.video-modal.active iframe');
        if (iframe) {
            iframe.contentWindow.postMessage({
                event: 'command',
                func: 'seekTo',
                args: [iframe.getCurrentTime() + seconds]
            }, '*');
        }
    },

    togglePlayPause() {
        const iframe = document.querySelector('.video-modal.active iframe');
        if (iframe) {
            iframe.contentWindow.postMessage({
                event: 'command',
                func: 'togglePlayPause'
            }, '*');
        }
    }
}; 