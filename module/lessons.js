// modules/lessons.js

// Array of vibrant colors for visual feedback and background gradients
export const colors = [
    '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#073B4C',
    '#FF9F1C', '#2EC4B6', '#E71D36', '#F7B801', '#A9F0D1',
    '#C70039', '#FFC300', '#DAF7A6', '#FF5733', '#C70039',
    '#6A0572', '#AB83A1', '#8E292E', '#D14081', '#F08A5D'
];

// Specific colors for 'color-recognition' lesson
export const lessonColorsPrimary = ['#FF0000', '#0000FF', '#00FF00']; // Red, Blue, Green
export const lessonColorsAll = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2']; // Expanded set

// Specific shapes for 'shape-recognition' lesson
export const lessonShapesBasic = ['●', '■', '▲']; // Circle, Square, Triangle
export const lessonShapesAdvanced = ['★', '◆', '❤', '⭐']; // Star, Diamond, Heart, Sparkle Star

// Characters for 'letter-number-introduction' lesson (A-Z, 0-9)
export const lessonLetters = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];
export const lessonNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// All characters/emojis for freeplay
export const characters = [
    ...lessonLetters, ...lessonNumbers,
    '⭐', '🌈', '🎉', '🎈', '✨', '🚀', '💖', '💡', '🎵', '🌸', '🌳', '☀️', '🌙', '☁️'
];

/**
 * Defines the behavior and content for each lesson mode.
 * 'type': 'emoji' for pop-ups, 'tracing' for canvas drawing.
 * 'emojis': Array of content for 'emoji' type.
 * 'colors': Array of colors for 'emoji' type (overrides general colors if present).
 * 'tracingItems': Array of content for 'tracing' type.
 * 'allowSwipeTrail': Boolean, whether swipe trails should appear in this mode.
 */
export const LessonDefinitions = {
    'freeplay': {
        type: 'emoji',
        emojis: characters,
        allowSwipeTrail: true,
        colors: colors // Use all colors for freeplay
    },
    'color-primary': {
        type: 'emoji',
        emojis: lessonShapesBasic, // Use basic shapes for color lessons
        colors: lessonColorsPrimary, // Specific colors for this lesson
        allowSwipeTrail: true
    },
    'color-all': {
        type: 'emoji',
        emojis: lessonShapesBasic, // Use basic shapes for color lessons
        colors: lessonColorsAll, // Specific colors for this lesson
        allowSwipeTrail: true
    },
    'shape-basic': {
        type: 'tracing',
        tracingItems: lessonShapesBasic,
        allowSwipeTrail: true // Allow swipe trail during tracing
    },
    'shape-advanced': {
        type: 'tracing',
        tracingItems: lessonShapesAdvanced,
        allowSwipeTrail: true // Allow swipe trail during tracing
    },
    'letter-az': {
        type: 'tracing',
        tracingItems: lessonLetters,
        allowSwipeTrail: true // Allow swipe trail during tracing
    },
    'number-09': {
        type: 'tracing',
        tracingItems: lessonNumbers,
        allowSwipeTrail: true // Allow swipe trail during tracing
    }
};

