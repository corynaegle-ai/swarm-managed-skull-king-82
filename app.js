/**
 * Skull King - Vanilla JS App
 * Main application entry point with state initialization
 */

// Application State
const appState = {
    initialized: false,
    version: '1.0.0',
    debug: true
};

/**
 * Initialize the application
 * Sets up the initial state and DOM
 */
function initializeApp() {
    try {
        // Log initialization start
        if (appState.debug) {
            console.log('🎮 Initializing Skull King App...');
            console.log('Version:', appState.version);
        }

        // Update app state
        appState.initialized = true;

        // Update DOM with initialized state
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = 'App initialized successfully!';
            welcomeMessage.style.borderLeftColor = '#28a745';
        }

        // Log successful initialization
        if (appState.debug) {
            console.log('✅ App initialized successfully');
            console.log('Application State:', appState);
        }

        return true;
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = 'Error initializing app. Please refresh the page.';
            welcomeMessage.style.borderLeftColor = '#dc3545';
        }
        return false;
    }
}

/**
 * Execute initialization when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}
