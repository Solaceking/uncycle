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
        // Add theme toggle button to nav
        const nav = document.querySelector('.nav-right');
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle';
        toggleBtn.innerHTML = `
            <svg class="theme-icon" viewBox="0 0 24 24">
                <path class="sun" d="M12 3v2m0 14v2M5.64 5.64l1.4 1.4m10.32 10.32l1.4 1.4M3 12h2m14 0h2M5.64 18.36l1.4-1.4m10.32-10.32l1.4-1.4"/>
                <circle class="sun-circle" cx="12" cy="12" r="4"/>
                <path class="moon" d="M12 3a9 9 0 109 9c0-4.97-4.03-9-9-9z"/>
            </svg>
        `;
        toggleBtn.addEventListener('click', () => this.toggle());
        nav.prepend(toggleBtn);
    }
}; 