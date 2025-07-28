// modules/visuals.js

import { AppState } from './state.js';
import { LessonDefinitions, colors as allColors } from './lessons.js'; // Import colors array

let visualFeedbackArea;
let celebrationMessageDiv;
let lockOverlay; // For background changes

// Initialize Tone.js Synth for sound feedback
const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.05, release: 0.3 },
    volume: -20
}).toDestination();

let audioContextStarted = false; // Flag to track if Tone.js audio context has started

// Array of musical notes for sound feedback
const notes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];

/**
 * Initializes the visuals module with necessary DOM elements.
 * @param {object} elements - Object containing references to visual DOM elements.
 */
export function initVisuals(elements) {
    visualFeedbackArea = elements.visualFeedbackArea;
    celebrationMessageDiv = elements.celebrationMessageDiv;
    lockOverlay = elements.lockOverlay;
}

/**
 * Gets a random element from an array.
 * @param {Array} arr - The array to pick from.
 * @returns {*} A random element from the array.
 */
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates and displays visual feedback based on interaction type and lesson mode.
 * @param {string} type - 'tap' or 'swipe'.
 * @param {number} x - X coordinate of interaction.
 * @param {number} y - Y coordinate of interaction.
 * @param {string} [content=''] - Optional content for tap (e.g., key pressed).
 */
export async function generateVisualFeedback(type, x, y, content = '') {
    // Ensure audio context is started on first interaction
    if (!audioContextStarted) {
        await Tone.start();
        audioContextStarted = true;
        console.log("AudioContext started:", Tone.context.state);
    }

    if (!AppState.isLocked || AppState.isParentModeActive) return; // Only generate feedback when locked AND not in parent mode

    const visualElement = document.createElement('div');
    visualElement.classList.add('visual-element');
    visualElement.style.left = `${x}px`;
    visualElement.style.top = `${y}px`;

    let elementContent = '';
    let elementColor = getRandomElement(allColors); // Default random color from allColors
    let elementFontSize = '';
    let isGlowTrail = false;

    // Determine content and styling based on interaction type and lesson mode
    if (type === 'tap') {
        if (AppState.isTracingModeActive) {
            // Taps in tracing mode are handled by tracing.js, no pop-ups here
            return;
        } else {
            const config = LessonDefinitions[AppState.currentLessonMode];
            if (config && config.type === 'emoji' && config.emojis && config.emojis.length > 0) {
                elementContent = getRandomElement(config.emojis);
                // For color lessons, override color based on config
                if (AppState.currentLessonMode.startsWith('color-')) {
                    elementColor = getRandomElement(config.colors);
                } else {
                    elementColor = getRandomElement(allColors);
                }
                elementFontSize = `${Math.random() * 60 + 40}px`;
            } else {
                // Fallback for unexpected lesson mode config or no emojis
                console.warn(`No emoji config for lesson mode: ${AppState.currentLessonMode}, falling back.`);
                elementContent = getRandomElement(['?', '!', '@']);
                elementColor = getRandomElement(allColors);
                elementFontSize = `${Math.random() * 60 + 40}px`;
            }
        }
    } else if (type === 'swipe') {
        // Swipes always generate subtle glow trails in all modes
        isGlowTrail = true;
        elementColor = getRandomElement(allColors); // Random color for glow
        elementFontSize = `${Math.random() * 10 + 5}px`; // Very small for subtle glow
        visualElement.classList.add('glow-trail'); // Add a specific class for glow trail styling
        visualElement.style.setProperty('--element-color', elementColor); // Pass color to CSS variable
    }

    if (!elementContent && !isGlowTrail) return; // Don't append if no content and not a glow trail

    visualElement.textContent = elementContent;
    visualElement.style.color = elementColor;
    visualElement.style.fontSize = elementFontSize;

    visualFeedbackArea.appendChild(visualElement);

    // Apply specific animations based on type
    if (isGlowTrail) {
        visualElement.style.opacity = 0.6; // Start visible
        visualElement.style.transform = 'scale(1)'; // Start at full size
        setTimeout(() => {
            visualElement.style.opacity = 0;
            visualElement.style.transform = 'scale(1.2)'; // Slightly grow as it fades
        }, 100); // Start fading very quickly
        setTimeout(() => {
            visualElement.remove(); // Remove after fade transition
        }, 600); // 100ms delay + 500ms transition
    } else {
        // For regular pop-up elements (taps in freeplay/color modes)
        const randomRotation = Math.random() * 360 - 180;
        visualElement.style.setProperty('--random-rotation', `${randomRotation}deg`);
        const driftX = (Math.random() - 0.5) * 100;
        const driftY = (Math.random() - 0.5) * 100;
        visualElement.style.setProperty('--drift-x', `${driftX}px`);
        visualElement.style.setProperty('--drift-y', `${driftY}px`);
        setTimeout(() => {
            visualElement.classList.add('show');
        }, 10);
        setTimeout(() => {
            visualElement.classList.remove('show');
            visualElement.classList.add('hide');
            visualElement.addEventListener('transitionend', () => {
                visualElement.remove();
            });
        }, 700);
    }

    synth.triggerAttackRelease(getRandomElement(notes), '8n');
}

/**
 * Shows a celebration message in the center of the screen.
 * @param {string} [message] - The message to display. If not provided, a random one is chosen.
 */
export function showCelebrationMessage(message) {
    const celebrationMessages = ["Great Job!", "Awesome!", "You Did It!", "Fantastic!", "Super!"];
    celebrationMessageDiv.textContent = message || getRandomElement(celebrationMessages);
    celebrationMessageDiv.classList.remove('hidden');
    setTimeout(() => {
        celebrationMessageDiv.classList.add('show');
    }, 10); // Small delay to trigger transition

    setTimeout(() => {
        hideCelebrationMessage();
    }, 1500); // Message visible for 1.5 seconds
}

/**
 * Hides the celebration message.
 */
export function hideCelebrationMessage() {
    celebrationMessageDiv.classList.remove('show');
    setTimeout(() => {
        celebrationMessageDiv.classList.add('hidden');
    }, 300); // Match CSS transition duration
}

/**
 * Changes the background to a random radial gradient.
 */
export function changeBackgroundGradient() {
    if (!AppState.isLocked || AppState.isParentModeActive || AppState.isTracingModeActive) return;
    const color1 = getRandomElement(allColors);
    const color2 = getRandomElement(allColors);
    lockOverlay.style.background = `radial-gradient(circle at center, ${color1}, ${color2})`;
    lockOverlay.style.backgroundSize = '200% 200%';
}

