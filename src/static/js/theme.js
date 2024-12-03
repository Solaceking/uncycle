// Theme management
const ThemeManager = {
    init() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.applyTheme();
        this.setupToggle();
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
    },

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    },

    setupToggle() {
        // Find toggle in settings dropdown
        const toggle = document.querySelector('#settings-dropdown .theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggle());
        }
    }
}; 