const SearchHistory = {
    maxItems: 10,
    storageKey: 'search_history',

    init() {
        this.history = this.loadHistory();
        this.setupKeyboardShortcuts();
    },

    loadHistory() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    },

    saveHistory() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    },

    addSearch(query) {
        // Remove if exists (to move to top)
        this.history = this.history.filter(item => item.query !== query);
        
        // Add to beginning
        this.history.unshift({
            query,
            timestamp: new Date().toISOString()
        });
        
        // Keep only maxItems
        if (this.history.length > this.maxItems) {
            this.history.pop();
        }
        
        this.saveHistory();
        this.updateUI();
    },

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.updateUI();
    },

    updateUI() {
        const container = document.getElementById('search-history');
        if (!container) return;

        container.innerHTML = `
            <div class="history-header">
                <h3>Recent Searches</h3>
                ${this.history.length ? '<button class="clear-history" onclick="SearchHistory.clearHistory()">Clear</button>' : ''}
            </div>
            ${this.history.map((item, index) => `
                <div class="history-item" onclick="quickSearch('${item.query}')" data-index="${index}">
                    <span class="history-query">${item.query}</span>
                    <span class="history-time">${this.formatTime(item.timestamp)}</span>
                </div>
            `).join('')}
        `;
    },

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Within last 24 hours
        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        // Within last week
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        // Older
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Press '/' to focus search
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                document.querySelector('.search-section input').focus();
            }
        });
    }
}; 