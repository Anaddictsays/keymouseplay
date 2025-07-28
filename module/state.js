// modules/state.js

/**
 * Centralized application state management.
 * Provides a single source of truth for various app flags and modes.
 */
export const AppState = {
    // Core application states
    isLocked: true,             // True if the screen is "locked"
    isParentModeActive: false,  // True if parent menu is currently displayed
    isTracingModeActive: false, // True if a tracing lesson is active (canvas input)
    hasInteracted: false,       // True after the first toddler interaction
    currentLessonMode: 'freeplay', // 'freeplay' | 'color-primary' | 'color-all' | 'shape-basic' | 'shape-advanced' | 'letter-az' | 'number-09'

    // DOM element references (initialized in main.js)
    _elements: {},

    /**
     * Initializes AppState with DOM element references.
     * @param {object} elements - Object containing references to key DOM elements.
     */
    init(elements) {
        this._elements = elements;
    },

    /**
     * Sets the current lesson mode and updates tracing state.
     * @param {string} mode - The new lesson mode.
     */
    setLessonMode(mode) {
        this.currentLessonMode = mode;
        // Automatically determine if tracing mode should be active based on the lesson
        this.isTracingModeActive = mode.startsWith('shape-') || mode.startsWith('letter-') || mode.startsWith('number-');
        console.log(`AppState: Lesson Mode set to "${this.currentLessonMode}", Tracing Active: ${this.isTracingModeActive}`);
    },

    /**
     * Sets the locked state of the application.
     * @param {boolean} locked - True to lock, false to unlock.
     */
    setLocked(locked) {
        this.isLocked = locked;
        if (this.isLocked) {
            this._elements.lockOverlay.style.display = 'flex';
            document.body.classList.remove('unlocked');
            document.body.classList.add('locked');
        } else {
            this._elements.lockOverlay.style.display = 'none';
            document.body.classList.remove('locked');
            document.body.classList.add('unlocked');
        }
    },

    /**
     * Sets whether parent mode is currently active (menu visible).
     * @param {boolean} active - True to activate parent mode, false to deactivate.
     */
    setParentModeActive(active) {
        this.isParentModeActive = active;
    },

    /**
     * Sets whether a toddler has interacted with the screen yet.
     * @param {boolean} interacted - True if interacted, false otherwise.
     */
    setHasInteracted(interacted) {
        this.hasInteracted = interacted;
    },

    /**
     * Resets the application state to its initial locked, freeplay state.
     */
    resetAppForLock() {
        this.isLocked = true;
        this.isParentModeActive = false;
        this.isTracingModeActive = false;
        this.hasInteracted = false;
        this.currentLessonMode = 'freeplay';
    }
};

