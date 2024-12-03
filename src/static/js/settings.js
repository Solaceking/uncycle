const Settings = {
    init() {
        this.loadSettings();
        this.setupEventListeners();
    },

    loadSettings() {
        this.settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
        this.applySettings();
    },

    saveSettings() {
        localStorage.setItem('app_settings', JSON.stringify(this.settings));
    },

    applySettings() {
        // Apply each setting
        if (this.settings.showHistory) {
            document.querySelector('.history-section').style.display = 'block';
        }
        // Add other settings applications here
    },

    toggleSetting(key) {
        this.settings[key] = !this.settings[key];
        this.saveSettings();
        this.applySettings();
    },

    setupEventListeners() {
        // Add event listeners for settings controls
    },

    showShortcutsModal() {
        const shortcuts = [
            { key: '/', description: 'Focus search' },
            { key: 'Esc', description: 'Close modals' },
            { key: '↑/↓', description: 'Navigate results' }
        ];

        const modal = document.createElement('div');
        modal.className = 'shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-content">
                <h2>Keyboard Shortcuts</h2>
                <div class="shortcuts-list">
                    ${shortcuts.map(s => `
                        <div class="shortcut-item">
                            <kbd>${s.key}</kbd>
                            <span>${s.description}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="close-modal">Close</button>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.close-modal').onclick = () => modal.remove();
    },

    clearAllData() {
        if (confirm('Are you sure? This will clear all your settings and history.')) {
            localStorage.clear();
            location.reload();
        }
    }
}; 