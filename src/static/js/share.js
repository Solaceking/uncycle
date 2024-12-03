const ShareManager = {
    init() {
        console.log('Share Manager initialized');
    },

    async shareVideo(videoId, title) {
        const shareData = {
            title: 'Uncycle - ' + title,
            text: 'Check out this upcycling tutorial!',
            url: `${window.location.origin}/watch/${videoId}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                this.showShareModal(shareData);
            }
        } catch (err) {
            console.warn('Share failed:', err);
        }
    },

    showShareModal(shareData) {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-content">
                <h3>Share This Tutorial</h3>
                <div class="share-preview">
                    <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="Video thumbnail">
                    <p>${shareData.title}</p>
                </div>
                <div class="share-options">
                    <button onclick="ShareManager.copyLink('${shareData.url}')" class="share-button copy">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                        Copy Link
                    </button>
                    <button onclick="window.open('https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}', '_blank')" class="share-button twitter">
                        <svg viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                        Tweet
                    </button>
                    <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}', '_blank')" class="share-button facebook">
                        <svg viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                        Share
                    </button>
                </div>
                <button class="close-modal" onclick="this.closest('.share-modal').remove()">×</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Animate in
        requestAnimationFrame(() => modal.classList.add('active'));
    },

    async copyLink(url) {
        try {
            await navigator.clipboard.writeText(url);
            this.showToast('Link copied to clipboard!');
        } catch (err) {
            console.warn('Copy failed:', err);
            // Fallback
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            this.showToast('Link copied to clipboard!');
        }
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.add('active');
            setTimeout(() => {
                toast.classList.remove('active');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        });
    }
}; 