// modules/parentMode.js

import { AppState } from './state.js';
import { generateVisualFeedback, hideCelebrationMessage } from './visuals.js';
import { clearCanvas, startNewTracingTarget } from './tracing.js';
import { colors as allColors } from './lessons.js'; // Import allColors for background gradient

// DOM element references (will be initialized via AppState._elements)
let mainTitle;
let mainMessage;
let parentModeInstruction;
let parentControlPanel;
let colorLessonPanel;
let shapeLessonPanel;
let letterNumberLessonPanel;
let backToParentMenuFromLessonBtn;
let lockOverlay;

// Parent Mode Activation Sequence
const parentModeSequence = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
let currentSequenceIndex = 0;
let lastTapTime = 0;
const tapTimeout = 2000; // 2 seconds to complete next tap in sequence

// Timer for parent mode instruction visibility
let parentInstructionTimer;
const initialMessageDuration = 7000; // 7 seconds for initial "Ready to Play" messages
const instructionShowDuration = 7000; // 7 seconds for parent mode instruction
const instructionHideDuration = 30000; // 30 seconds for parent mode instruction

/**
 * Initializes this module by getting references to DOM elements from AppState.
 * This function is called internally by lockScreen.
 */
function _initDOMElements() {
    const elements = AppState._elements;
    mainTitle = elements.mainTitle;
    mainMessage = elements.mainMessage;
    parentModeInstruction = elements.parentModeInstruction;
    parentControlPanel = elements.parentControlPanel;
    colorLessonPanel = elements.colorLessonPanel;
    shapeLessonPanel = elements.shapeLessonPanel;
    letterNumberLessonPanel = elements.letterNumberLessonPanel;
    backToParentMenuFromLessonBtn = elements.backToParentMenuFromLessonBtn;
    lockOverlay = elements.lockOverlay;
}

/**
 * Hides the initial "Ready to Play" messages.
 */
export function hideInitialMessages() {
    if (mainTitle) mainTitle.classList.add('hidden');
    if (mainMessage) mainMessage.classList.add('hidden');
}

/**
 * Shows the initial "Ready to Play" messages.
 */
export function showInitialMessages() {
    if (mainTitle) mainTitle.classList.remove('hidden');
    if (mainMessage) mainMessage.classList.remove('hidden');
}

/**
 * Manages the timed visibility of the parent mode activation instruction.
 */
export function startParentInstructionTimer() {
    if (!parentModeInstruction) return; // Ensure element is available

    // Clear any existing timer
    if (parentInstructionTimer) clearInterval(parentInstructionTimer);

    // Only start instruction timer if in freeplay mode
    if (AppState.currentLessonMode === 'freeplay') {
        function showAndHideParentInstruction() {
            parentModeInstruction.classList.remove('hidden');
            parentModeInstruction.classList.add('animate-heartbeat'); // Ensure animation is active
            setTimeout(() => {
                parentModeInstruction.classList.add('hidden');
                parentModeInstruction.classList.remove('animate-heartbeat'); // Remove animation when hidden
            }, instructionShowDuration);
        }

        // Show immediately, then set interval for repeated show/hide
        showAndHideParentInstruction();
        parentInstructionTimer = setInterval(showAndHideParentInstruction, instructionHideDuration + instructionShowDuration);
    } else {
        // If not in freeplay, ensure instruction is hidden
        parentModeInstruction.classList.add('hidden');
        parentModeInstruction.classList.remove('animate-heartbeat');
    }
}

/**
 * Stops the parent mode instruction timer and hides the instruction.
 */
export function stopParentInstructionTimer() {
    if (parentInstructionTimer) {
        clearInterval(parentInstructionTimer);
        parentInstructionTimer = null;
    }
    if (parentModeInstruction) {
        parentModeInstruction.classList.add('hidden');
        parentModeInstruction.classList.remove('animate-heartbeat');
    }
}

/**
 * Determines which corner of the screen was tapped.
 * @param {number} x - X coordinate of the tap.
 * @param {number} y - Y coordinate of the tap.
 * @returns {string|null} The name of the corner ('top-left', 'top-right', etc.) or null if not in a corner.
 */
export function getCorner(x, y) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const cornerThreshold = 0.2; // 20% of screen width/height for corner detection

    if (x < width * cornerThreshold && y < height * cornerThreshold) {
        return 'top-left';
    } else if (x > width * (1 - cornerThreshold) && y < height * cornerThreshold) {
        return 'top-right';
    } else if (x > width * (1 - cornerThreshold) && y > height * (1 - cornerThreshold)) {
        return 'bottom-right';
    } else if (x < width * cornerThreshold && y > height * (1 - cornerThreshold)) {
        return 'bottom-left';
    }
    return null; // Not in a defined corner
}

/**
 * Hides all parent lesson panels.
 */
export function hideAllLessonPanels() {
    const panels = [parentControlPanel, colorLessonPanel, shapeLessonPanel, letterNumberLessonPanel];
    panels.forEach(panel => {
        if (panel) {
            panel.classList.remove('show');
            panel.classList.add('hidden');
        }
    });
}

/**
 * Shows a specific lesson panel.
 * @param {HTMLElement} panelElement - The panel to show.
 */
export function showLessonPanel(panelElement) {
    hideAllLessonPanels(); // Hide all others first
    if (panelElement) {
        panelElement.classList.remove('hidden');
        setTimeout(() => {
            panelElement.classList.add('show');
        }, 10);
    }
}

/**
 * Activates parent mode, showing the main parent menu.
 */
export function activateParentMode() {
    AppState.setParentModeActive(true);
    stopParentInstructionTimer(); // Stop instruction timer when entering parent mode
    hideInitialMessages(); // Ensure initial messages are hidden if parent mode is activated early

    showLessonPanel(parentControlPanel); // Show the main parent control panel

    console.log("Parent Mode Activated!");
    // Change background to indicate parent mode
    if (lockOverlay) {
        lockOverlay.style.background = `radial-gradient(circle at center, #333333, #111111)`; // Subtle gray
        lockOverlay.style.animation = 'none'; // Stop background flow animation
        lockOverlay.style.backgroundSize = 'cover'; // Reset background size for static color
    }

    // Hide the "Back to Parent Menu" button that appears during active lesson play
    if (backToParentMenuFromLessonBtn) {
        backToParentMenuFromLessonBtn.classList.add('hidden');
    }
}

/**
 * Deactivates parent mode, returning to the toddler interaction screen.
 * Resets tracing, canvas, and background.
 */
export function deactivateParentMode() {
    AppState.setParentModeActive(false);
    currentSequenceIndex = 0; // Reset sequence for 4-corner tap
    lastTapTime = 0; // Reset tap time

    hideAllLessonPanels(); // Hide all parent/lesson panels

    // Reset tracing mode
    AppState.isTracingModeActive = false;
    clearCanvas(); // Clear anything drawn on the canvas

    // Show the "Back to Parent Menu" button if we are entering a lesson mode (not freeplay)
    if (backToParentMenuFromLessonBtn) {
        if (AppState.currentLessonMode !== 'freeplay') {
            backToParentMenuFromLessonBtn.classList.remove('hidden');
        } else {
            backToParentMenuFromLessonBtn.classList.add('hidden');
        }
    }

    // Start parent instruction timer ONLY if in freeplay mode
    startParentInstructionTimer(); // This function now handles the conditional starting based on AppState.currentLessonMode

    // Reset background to dynamic
    if (lockOverlay) {
        lockOverlay.style.animation = 'background-flow 30s linear infinite alternate';
        lockOverlay.style.backgroundSize = '200% 200%';
        // Ensure changeBackgroundGradient is called to set initial dynamic gradient
        const color1 = getRandomElement(allColors); // Use allColors here
        const color2 = getRandomElement(allColors); // Use allColors here
        lockOverlay.style.background = `radial-gradient(circle at center, ${color1}, ${color2})`;
    }
    AppState.setHasInteracted(false); // Reset interaction flag so initial messages can show again on re-lock
    hideCelebrationMessage(); // Ensure celebration message is hidden
}

/**
 * Returns from an active lesson display directly to the main parent menu.
 */
export function returnToParentMenuFromLesson() {
    AppState.setParentModeActive(true); // Re-activate parent mode
    AppState.isTracingModeActive = false; // Ensure tracing is off
    clearCanvas(); // Clear canvas
    stopParentInstructionTimer(); // Ensure instruction timer is stopped

    // Hide the "Back to Parent Menu" button from lesson display
    if (backToParentMenuFromLessonBtn) {
        backToParentMenuFromLessonBtn.classList.add('hidden');
    }

    showLessonPanel(parentControlPanel); // Show the main parent control panel

    // Set background to parent mode theme
    if (lockOverlay) {
        lockOverlay.style.background = `radial-gradient(circle at center, #333333, #111111)`;
        lockOverlay.style.animation = 'none';
        lockOverlay.style.backgroundSize = 'cover';
    }
    console.log("Returned to Parent Menu from Lesson.");
    hideCelebrationMessage(); // Ensure celebration message is hidden
}

/**
 * Locks the screen and initializes the app state.
 */
export function lockScreen() {
    _initDOMElements(); // Initialize DOM elements on lock
    AppState.resetAppForLock(); // Reset all app state flags
    AppState.setLocked(true); // Set locked state

    // Initial state: show toddler messages, hide parent instruction and all panels, hide new back button
    showInitialMessages();
    stopParentInstructionTimer(); // Ensure it's stopped before initial timeout
    parentModeInstruction.classList.add('hidden');
    hideAllLessonPanels(); // Ensure all panels are hidden
    if (AppState._elements.backToParentMenuFromLessonBtn) { // Defensive check
        AppState._elements.backToParentMenuFromLessonBtn.classList.add('hidden'); // Ensure this is hidden initially
    }

    // After initialMessageDuration, hide toddler messages and start parent instruction cycle
    setTimeout(() => {
        // Only transition if toddler hasn't interacted and parent mode isn't active
        // And only if we are in freeplay mode
        if (!AppState.hasInteracted && !AppState.isParentModeActive && AppState.currentLessonMode === 'freeplay') {
            hideInitialMessages();
            startParentInstructionTimer();
        }
    }, initialMessageDuration);

    // Call deactivateParentMode to correctly set up initial state (background, timers)
    deactivateParentMode();
}

/**
 * Unlocks the screen and resets the app state.
 */
export function unlockScreen() {
    AppState.setLocked(false);
    stopParentInstructionTimer(); // Stop instruction timer when unlocked
    deactivateParentMode(); // Ensure parent mode is off if unlocked
}

// Export parentModeSequence and related variables for events.js to use
export { parentModeSequence, currentSequenceIndex, lastTapTime, tapTimeout };

