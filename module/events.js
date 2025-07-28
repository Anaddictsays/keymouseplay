// modules/events.js

import { AppState } from './state.js';
import { generateVisualFeedback, changeBackgroundGradient } from './visuals.js';
import { startDrawing, draw, stopDrawing } from './tracing.js';
import { getCorner, activateParentMode, unlockScreen, parentModeSequence, currentSequenceIndex, lastTapTime, tapTimeout, returnToParentMenuFromLesson, showLessonPanel } from './parentMode.js';

// DOM element references (will be passed from main.js)
let lockOverlay;
let colorBtn, shapeBtn, letterNumberBtn, freeplayBtn;
let colorPrimaryBtn, colorAllBtn, colorBackBtn;
let shapeBasicBtn, shapeAdvancedBtn, shapeBackBtn;
let letterAZBtn, number09Btn, letterNumberBackBtn;
let backToParentMenuFromLessonBtn;


/**
 * Registers all global and button-specific event listeners for the application.
 * @param {object} elements - Object containing all necessary DOM element references.
 */
export function registerEventListeners(elements) {
    // Assign DOM elements locally
    lockOverlay = elements.lockOverlay;
    colorBtn = elements.colorBtn;
    shapeBtn = elements.shapeBtn;
    letterNumberBtn = elements.letterNumberBtn;
    freeplayBtn = elements.freeplayBtn;
    colorPrimaryBtn = elements.colorPrimaryBtn;
    colorAllBtn = elements.colorAllBtn;
    colorBackBtn = elements.colorBackBtn;
    shapeBasicBtn = elements.shapeBasicBtn;
    shapeAdvancedBtn = elements.shapeAdvancedBtn;
    shapeBackBtn = elements.shapeBackBtn;
    letterAZBtn = elements.letterAZBtn;
    number09Btn = elements.number09Btn;
    letterNumberBackBtn = elements.letterNumberBackBtn;
    backToParentMenuFromLessonBtn = elements.backToParentMenuFromLessonBtn;


    // Global keyboard listener for unlock
    document.addEventListener('keydown', handleKeyDown);

    // Touch and mouse events on the lock overlay
    lockOverlay.addEventListener('touchstart', handleTouchStart, { passive: false });
    lockOverlay.addEventListener('touchmove', handleTouchMove, { passive: false });
    lockOverlay.addEventListener('touchend', handleTouchEnd);
    lockOverlay.addEventListener('mousemove', handleTouchMove); // Mousemove uses touchmove handler
    lockOverlay.addEventListener('click', handleTouchStart); // Click uses touchstart handler for now, as it also triggers the parent mode sequence logic

    // Parent control panel button listeners
    colorBtn.addEventListener('click', () => { showLessonPanel(elements.colorLessonPanel); });
    shapeBtn.addEventListener('click', () => { showLessonPanel(elements.shapeLessonPanel); });
    letterNumberBtn.addEventListener('click', () => { showLessonPanel(elements.letterNumberLessonPanel); });
    freeplayBtn.addEventListener('click', () => {
        AppState.setLessonMode('freeplay');
        console.log("Lesson Mode: Freeplay");
        deactivateParentMode();
    });

    // Lesson specific panel button listeners
    colorPrimaryBtn.addEventListener('click', () => {
        AppState.setLessonMode('color-primary');
        console.log("Lesson Mode: Color - Primary Colors");
        deactivateParentMode();
    });
    colorAllBtn.addEventListener('click', () => {
        AppState.setLessonMode('color-all');
        console.log("Lesson Mode: Color - All Colors");
        deactivateParentMode();
    });
    colorBackBtn.addEventListener('click', () => { showLessonPanel(elements.parentControlPanel); });

    shapeBasicBtn.addEventListener('click', () => {
        AppState.setLessonMode('shape-basic');
        console.log("Lesson Mode: Shape - Basic Shapes (Tracing)");
        deactivateParentMode();
        startNewTracingTarget();
    });
    shapeAdvancedBtn.addEventListener('click', () => {
        AppState.setLessonMode('shape-advanced');
        console.log("Lesson Mode: Shape - Advanced Shapes (Tracing)");
        deactivateParentMode();
        startNewTracingTarget();
    });
    shapeBackBtn.addEventListener('click', () => {
        AppState.isTracingModeActive = false; // Deactivate tracing when going back to menu
        clearCanvas(); // Clear canvas
        showLessonPanel(elements.parentControlPanel);
    });

    letterAZBtn.addEventListener('click', () => {
        AppState.setLessonMode('letter-az');
        console.log("Lesson Mode: Letter/Number - Letters (A-Z) (Tracing)");
        deactivateParentMode();
        startNewTracingTarget();
    });
    number09Btn.addEventListener('click', () => {
        AppState.setLessonMode('number-09');
        console.log("Lesson Mode: Letter/Number - Numbers (0-9) (Tracing)");
        deactivateParentMode();
        startNewTracingTarget();
    });
    letterNumberBackBtn.addEventListener('click', () => {
        AppState.isTracingModeActive = false; // Deactivate tracing when going back to menu
        clearCanvas(); // Clear canvas
        showLessonPanel(elements.parentControlPanel);
    });

    // Event listener for the "Back to Parent Menu" button visible during active lesson play
    backToParentMenuFromLessonBtn.addEventListener('click', returnToParentMenuFromLesson);
}


/**
 * Handles global keydown events, primarily for unlock.
 * @param {KeyboardEvent} event
 */
function handleKeyDown(event) {
    if (AppState.isLocked) {
        event.preventDefault();

        // Check for unlock combination: Ctrl + Shift + L
        if (event.ctrlKey && event.shiftKey && event.key === 'L') {
            unlockScreen();
        } else if (!AppState.isParentModeActive && !AppState.isTracingModeActive) {
            // Only generate toddler feedback if not in parent mode or tracing
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            generateVisualFeedback('tap', x, y, event.key.toUpperCase());
            changeBackgroundGradient();
        }
    }
}

/**
 * Handles touchstart and click events on the lock overlay.
 * @param {Event} event
 */
function handleTouchStart(event) {
    if (AppState.isLocked) {
        event.preventDefault();
        AppState.isTouching = true;

        const touch = event.touches ? event.touches[0] : event;
        const tappedCorner = getCorner(touch.clientX, touch.clientY);
        const currentTime = Date.now();

        // Parent Mode Activation Logic
        const targetIsButton = event.target.tagName === 'BUTTON';
        if (!AppState.isParentModeActive && tappedCorner && !targetIsButton) {
            if (currentTime - lastTapTime > tapTimeout) {
                currentSequenceIndex = 0;
            }

            if (tappedCorner === parentModeSequence[currentSequenceIndex]) {
                currentSequenceIndex++;
                if (currentSequenceIndex === parentModeSequence.length) {
                    activateParentMode();
                    currentSequenceIndex = 0;
                }
            } else {
                currentSequenceIndex = 0;
            }
            lastTapTime = currentTime;
        } else if (!AppState.isParentModeActive && !targetIsButton) {
            currentSequenceIndex = 0;
        }

        if (!AppState.isParentModeActive) {
            AppState.setHasInteracted(true); // Mark interaction
            if (AppState.isTracingModeActive) {
                startDrawing(event);
            } else {
                generateVisualFeedback('tap', touch.clientX, touch.clientY);
                changeBackgroundGradient();
            }
        }
    }
}

/**
 * Handles touchmove and mousemove events on the lock overlay.
 * @param {Event} event
 */
let lastTouchMoveTime = 0;
const touchMoveThrottle = 30;
function handleTouchMove(event) {
    if (AppState.isLocked && AppState.isTouching && !AppState.isParentModeActive) {
        event.preventDefault();
        const currentTime = Date.now();

        if (AppState.isTracingModeActive) {
            draw(event);
        }

        // Always generate swipe effects if not in parent mode (including tracing modes)
        if (currentTime - lastTouchMoveTime > touchMoveThrottle) {
            const touch = event.touches ? event.touches[0] : event;
            generateVisualFeedback('swipe', touch.clientX, touch.clientY);
            lastTouchMoveTime = currentTime;
            if (Math.random() < 0.02) { // Less frequent background change for swipes
                changeBackgroundGradient();
            }
        }
    }
}

/**
 * Handles touchend event on the lock overlay.
 */
function handleTouchEnd(event) {
    if (AppState.isLocked) {
        AppState.isTouching = false;
        if (AppState.isTracingModeActive) {
            stopDrawing();
        }
    }
}

