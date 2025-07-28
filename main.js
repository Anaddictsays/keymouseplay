import { registerEventListeners } from './modules/events.js';
import { initCanvas, resizeCanvas } from './modules/tracing.js';
import { AppState } from './modules/state.js';
import { lockScreen, unlockScreen, showInitialMessages, hideInitialMessages, startParentInstructionTimer, stopParentInstructionTimer, deactivateParentMode } from './modules/parentMode.js';
import { initVisuals } from './modules/visuals.js';

// Get references to main DOM elements needed globally or for initialization
const lockOverlay = document.getElementById('lock-overlay');
const mainTitle = document.getElementById('main-title');
const mainMessage = document.getElementById('main-message');
const parentModeInstruction = document.getElementById('parent-mode-instruction');
const parentControlPanel = document.getElementById('parent-control-panel');
const tracingCanvas = document.getElementById('tracing-canvas');
const visualFeedbackArea = document.getElementById('visual-feedback-area');
const celebrationMessageDiv = document.getElementById('celebration-message');

// Get references to parent mode buttons (main menu)
const colorBtn = document.getElementById('color-recognition-btn');
const shapeBtn = document.getElementById('shape-recognition-btn');
const letterNumberBtn = document.getElementById('letter-number-btn');
const freeplayBtn = document.getElementById('freeplay-btn');

// Get references to lesson specific panels and their buttons
const colorLessonPanel = document.getElementById('color-lesson-panel');
const colorPrimaryBtn = document.getElementById('color-primary-btn');
const colorAllBtn = document.getElementById('color-all-btn');
const colorBackBtn = document.getElementById('color-back-btn');

const shapeLessonPanel = document.getElementById('shape-lesson-panel');
const shapeBasicBtn = document.getElementById('shape-basic-btn');
const shapeAdvancedBtn = document.getElementById('shape-advanced-btn');
const shapeBackBtn = document.getElementById('shape-back-btn');

const letterNumberLessonPanel = document.getElementById('letter-number-lesson-panel');
const letterAZBtn = document.getElementById('letter-az-btn');
const number09Btn = document.getElementById('number-09-btn');
const letterNumberBackBtn = document.getElementById('letter-number-back-btn');

// Button for returning to parent menu from active lesson
const backToParentMenuFromLessonBtn = document.getElementById('back-to-parent-menu-from-lesson');


window.onload = () => {
    // Pass DOM element references to modules that need them
    AppState.init({
        mainTitle, mainMessage, parentModeInstruction, parentControlPanel,
        colorLessonPanel, shapeLessonPanel, letterNumberLessonPanel,
        backToParentMenuFromLessonBtn, lockOverlay
    });

    initVisuals({
        visualFeedbackArea, celebrationMessageDiv, lockOverlay
    });

    initCanvas(tracingCanvas);

    // Register all event listeners
    registerEventListeners({
        lockOverlay,
        colorBtn, shapeBtn, letterNumberBtn, freeplayBtn,
        colorPrimaryBtn, colorAllBtn, colorBackBtn,
        shapeBasicBtn, shapeAdvancedBtn, shapeBackBtn,
        letterAZBtn, number09Btn, letterNumberBackBtn,
        backToParentMenuFromLessonBtn
    });

    // Set initial canvas size and handle resizing
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Lock the screen and start the application
    lockScreen();
};

// Expose unlockScreen globally for Ctrl+Shift+L
window.unlockScreen = unlockScreen;

