// modules/tracing.js

import { AppState } from './state.js';
import { LessonDefinitions, colors as allColors } from './lessons.js'; // Import colors for trace line
import { showCelebrationMessage } from './visuals.js';

let tracingCanvas;
let ctx;
let currentTargetToTrace = null; // Stores { type: 'shape'/'letter', content: '●'/'A' }
let currentSequenceIndexTracing = 0; // Tracks index within tracing sequences

let isDrawing = false;
let lastX = 0;
let lastY = 0;

/**
 * Initializes the tracing module with the canvas element.
 * @param {HTMLCanvasElement} canvasEl - The canvas DOM element.
 */
export function initCanvas(canvasEl) {
    tracingCanvas = canvasEl;
    ctx = tracingCanvas.getContext('2d');
    resizeCanvas(); // Set initial size
    window.addEventListener('resize', resizeCanvas); // Listen for resize events
}

/**
 * Clears the canvas and disables pointer events.
 */
export function clearCanvas() {
    if (ctx) {
        ctx.clearRect(0, 0, tracingCanvas.width, tracingCanvas.height);
    }
    if (tracingCanvas) {
        tracingCanvas.style.pointerEvents = 'none'; // Disable pointer events on canvas when not tracing
    }
}

/**
 * Resizes the canvas to fill the window and redraws the current outline if tracing.
 */
export function resizeCanvas() {
    if (tracingCanvas) {
        tracingCanvas.width = window.innerWidth;
        tracingCanvas.height = window.innerHeight;
    }
    // Redraw content if needed after resize (important for tracing)
    if (AppState.isTracingModeActive && currentTargetToTrace) {
        drawOutline(currentTargetToTrace.type, currentTargetToTrace.content);
    }
}

/**
 * Draws the faint outline of a shape or letter/number on the canvas.
 * @param {string} type - 'shape' or 'letter' or 'number'.
 * @param {string} content - The character or symbol to draw.
 */
export function drawOutline(type, content) {
    clearCanvas();
    if (!ctx || !tracingCanvas) return;

    tracingCanvas.style.pointerEvents = 'auto'; // Enable pointer events on canvas for tracing

    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; // Faint white outline
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Center the drawing
    const centerX = tracingCanvas.width / 2;
    const centerY = tracingCanvas.height / 2;
    const size = Math.min(tracingCanvas.width, tracingCanvas.height) * 0.4; // Responsive size

    ctx.save(); // Save current context state
    ctx.translate(centerX, centerY); // Move origin to center

    if (type === 'shape') {
        ctx.beginPath();
        if (content === '●') { // Circle
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        } else if (content === '■') { // Square
            ctx.rect(-size / 2, -size / 2, size, size);
        } else if (content === '▲') { // Triangle
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(size / 2, size / 2);
            ctx.lineTo(-size / 2, size / 2);
            ctx.closePath();
        } else if (content === '★') { // Star (simplified)
            const outerRadius = size / 2;
            const innerRadius = outerRadius / 2.5;
            let rot = Math.PI / 2 * 3;
            let x = 0;
            let y = 0;
            const step = Math.PI / 5;

            ctx.moveTo(0, -outerRadius);
            for (let i = 0; i < 5; i++) {
                x = outerRadius * Math.cos(rot);
                y = outerRadius * Math.sin(rot);
                ctx.lineTo(x, y);
                rot += step;

                x = innerRadius * Math.cos(rot);
                y = innerRadius * Math.sin(rot);
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.closePath();
        } else if (content === '◆') { // Diamond
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(size / 2, 0);
            ctx.lineTo(0, size / 2);
            ctx.lineTo(-size / 2, 0);
            ctx.closePath();
        } else if (content === '❤') { // Heart (simplified)
            ctx.moveTo(0, size * 0.2);
            ctx.bezierCurveTo(size * 0.5, -size * 0.5, size, size * 0.1, 0, size * 0.8);
            ctx.bezierCurveTo(-size, size * 0.1, -size * 0.5, -size * 0.5, 0, size * 0.2);
            ctx.closePath();
        } else if (content === '⭐') { // Another star variation if needed, or fallback
            const outerRadius = size / 2;
            const innerRadius = outerRadius * 0.4; // Adjust for a different star look
            let rot = Math.PI / 2 * 3;
            let x = 0;
            let y = 0;
            const step = Math.PI / 5;

            ctx.moveTo(0, -outerRadius);
            for (let i = 0; i < 5; i++) {
                x = outerRadius * Math.cos(rot);
                y = outerRadius * Math.sin(rot);
                ctx.lineTo(x, y);
                rot += step;

                x = innerRadius * Math.cos(rot);
                y = innerRadius * Math.sin(rot);
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.closePath();
        }
        ctx.stroke();
    } else if (type === 'letter' || type === 'number') {
        ctx.font = `${size * 0.8}px 'Inter', sans-serif`; // Adjust font size for responsiveness
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(content, 0, 0); // Draw text outline
    }
    ctx.restore(); // Restore context state
}

/**
 * Starts a new drawing stroke on the canvas.
 * @param {Event} e - The touch or mouse event.
 */
export function startDrawing(e) {
    if (!AppState.isLocked || !AppState.isTracingModeActive || !ctx) return;
    isDrawing = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    [lastX, lastY] = [clientX, clientY];
    // Start a new path for each new stroke
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineWidth = 20; // Thickness of the trace line
    ctx.strokeStyle = getRandomElement(allColors); // Random vibrant color for the trace
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

/**
 * Draws a line segment on the canvas as the user moves their finger/mouse.
 * @param {Event} e - The touch or mouse event.
 */
export function draw(e) {
    if (!isDrawing || !AppState.isLocked || !AppState.isTracingModeActive || !ctx) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX, clientY);
    ctx.stroke();
    [lastX, lastY] = [clientX, clientY];
}

/**
 * Stops the current drawing stroke and handles completion feedback.
 */
export function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    // After a stroke, briefly fill the outline for completion feedback
    if (AppState.isTracingModeActive && currentTargetToTrace && ctx) {
        ctx.save();
        ctx.translate(tracingCanvas.width / 2, tracingCanvas.height / 2);
        ctx.fillStyle = getRandomElement(allColors); // Fill with a vibrant color
        const size = Math.min(tracingCanvas.width, tracingCanvas.height) * 0.4;

        if (currentTargetToTrace.type === 'shape') {
            ctx.beginPath();
            if (currentTargetToTrace.content === '●') { ctx.arc(0, 0, size / 2, 0, Math.PI * 2); }
            else if (currentTargetToTrace.content === '■') { ctx.rect(-size / 2, -size / 2, size, size); }
            else if (currentTargetToTrace.content === '▲') { ctx.moveTo(0, -size / 2); ctx.lineTo(size / 2, size / 2); ctx.lineTo(-size / 2, size / 2); ctx.closePath(); }
            else if (currentTargetToTrace.content === '★') {
                const outerRadius = size / 2; const innerRadius = outerRadius / 2.5; let rot = Math.PI / 2 * 3; let x = 0; let y = 0; const step = Math.PI / 5;
                ctx.moveTo(0, -outerRadius); for (let i = 0; i < 5; i++) { x = outerRadius * Math.cos(rot); y = outerRadius * Math.sin(rot); ctx.lineTo(x, y); rot += step; x = innerRadius * Math.cos(rot); y = innerRadius * Math.sin(rot); ctx.lineTo(x, y); rot += step; } ctx.closePath();
            } else if (currentTargetToTrace.content === '◆') {
                ctx.moveTo(0, -size / 2); ctx.lineTo(size / 2, 0); ctx.lineTo(0, size / 2); ctx.lineTo(-size / 2, 0); ctx.closePath();
            } else if (currentTargetToTrace.content === '❤') {
                ctx.moveTo(0, size * 0.2); ctx.bezierCurveTo(size * 0.5, -size * 0.5, size, size * 0.1, 0, size * 0.8); ctx.bezierCurveTo(-size, size * 0.1, -size * 0.5, -size * 0.5, 0, size * 0.2); ctx.closePath();
            } else if (currentTargetToTrace.content === '⭐') {
                const outerRadius = size / 2; const innerRadius = outerRadius * 0.4; let rot = Math.PI / 2 * 3; let x = 0; let y = 0; const step = Math.PI / 5;
                ctx.moveTo(0, -outerRadius); for (let i = 0; i < 5; i++) { x = outerRadius * Math.cos(rot); y = outerRadius * Math.sin(rot); ctx.lineTo(x, y); rot += step; x = innerRadius * Math.cos(rot); y = innerRadius * Math.sin(rot); ctx.lineTo(x, y); rot += step; } ctx.closePath();
            }
            ctx.fill(); // Fill the shape
        } else if (currentTargetToTrace.type === 'letter' || currentTargetToTrace.type === 'number') {
            ctx.font = `${size * 0.8}px 'Inter', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(currentTargetToTrace.content, 0, 0); // Fill the text
        }
        ctx.restore();

        // Show celebration message
        showCelebrationMessage("Great Job!");

        // After a short delay, draw a new tracing target
        setTimeout(() => {
            startNewTracingTarget();
        }, 1000); // Short delay for visual feedback + celebration
    }
}

/**
 * Starts a new tracing target based on the current lesson mode.
 * Cycles through the defined sequence for the selected lesson.
 */
export function startNewTracingTarget() {
    let targetContent = '';
    let targetType = '';
    let sequenceArray = [];

    const config = LessonDefinitions[AppState.currentLessonMode];
    if (config && config.type === 'tracing' && config.tracingItems && config.tracingItems.length > 0) {
        sequenceArray = config.tracingItems;
        targetType = AppState.currentLessonMode.startsWith('shape') ? 'shape' : (AppState.currentLessonMode.startsWith('letter') ? 'letter' : 'number');
    }

    if (sequenceArray.length > 0) {
        targetContent = sequenceArray[currentSequenceIndexTracing];
        currentSequenceIndexTracing = (currentSequenceIndexTracing + 1) % sequenceArray.length; // Cycle through sequence
        currentTargetToTrace = { type: targetType, content: targetContent };
        drawOutline(targetType, targetContent);
    } else {
        clearCanvas(); // Clear canvas if no tracing target is set
        currentTargetToTrace = null;
    }
}

