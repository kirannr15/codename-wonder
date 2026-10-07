/**
 * KeySafari - Interactive Keyboard Play for Toddlers
 * A colorful, fullscreen toy for supervised play with multiple modes
 */

// ============================================
// Configuration
// ============================================
const CONFIG = {
    // Decorative pastel colors; not a medical eye-safety guarantee.
    colors: [
        '#FFDDE1', '#FFE5DC', '#C5DEF5', '#D4EED4', '#FFF3D6',
        '#E6DDED', '#FFD4CC', '#D6EAF8', '#FFCFC2', '#B5DDB5',
        '#C9B8D9', '#A8CCE8'
    ],
    rainbowColors: [
        '#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB', '#1DD1A1',
        '#5F27CD', '#FF6B9D', '#54A0FF', '#00D2D3', '#FF9FF3'
    ],
    shapes: ['circle', 'square', 'star', 'heart', 'triangle'],
    animations: ['pop-scale', 'float-up', 'bounce-fade', 'burst'],
    soundEnabled: true,
    bubbleInterval: 800,
    maxBubbles: 20,
    maxShapes: 50,
    shapeDuration: 2000,
    letterDuration: 2500
};

// Animal data for Animal Mode
const ANIMALS = {
    'a': { emoji: '🐜', name: 'Ant', sound: 'chirp' },
    'b': { emoji: '🐻', name: 'Bear', sound: 'growl' },
    'c': { emoji: '🐱', name: 'Cat', sound: 'meow' },
    'd': { emoji: '🐕', name: 'Dog', sound: 'bark' },
    'e': { emoji: '🐘', name: 'Elephant', sound: 'trumpet' },
    'f': { emoji: '🐸', name: 'Frog', sound: 'ribbit' },
    'g': { emoji: '🦒', name: 'Giraffe', sound: 'hum' },
    'h': { emoji: '🦔', name: 'Hedgehog', sound: 'sniff' },
    'i': { emoji: '🦎', name: 'Iguana', sound: 'hiss' },
    'j': { emoji: '🐆', name: 'Jaguar', sound: 'roar' },
    'k': { emoji: '🦘', name: 'Kangaroo', sound: 'thump' },
    'l': { emoji: '🦁', name: 'Lion', sound: 'roar' },
    'm': { emoji: '🐭', name: 'Mouse', sound: 'squeak' },
    'n': { emoji: '🦎', name: 'Newt', sound: 'chirp' },
    'o': { emoji: '🦉', name: 'Owl', sound: 'hoot' },
    'p': { emoji: '🐷', name: 'Pig', sound: 'oink' },
    'q': { emoji: '🦆', name: 'Quail', sound: 'chirp' },
    'r': { emoji: '🐰', name: 'Rabbit', sound: 'thump' },
    's': { emoji: '🐍', name: 'Snake', sound: 'hiss' },
    't': { emoji: '🐯', name: 'Tiger', sound: 'growl' },
    'u': { emoji: '🦄', name: 'Unicorn', sound: 'neigh' },
    'v': { emoji: '🦅', name: 'Vulture', sound: 'screech' },
    'w': { emoji: '🐺', name: 'Wolf', sound: 'howl' },
    'x': { emoji: '🐟', name: 'X-ray fish', sound: 'hum' },
    'y': { emoji: '🦬', name: 'Yak', sound: 'grunt' },
    'z': { emoji: '🦓', name: 'Zebra', sound: 'neigh' }
};

// ============================================
// State Management
// ============================================
let currentMode = null;
let isPlaying = false;
let bubbleScore = 0;
let bubbleSpawnInterval = null;
let audioContext = null;
let followerFrame = null;
let returnFocus = null;
let playTimer = null;
let playDeadline = null;
let selectedPlayMinutes = null;
let isBatteryLow = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const effectTimers = new Set();

function scheduleEffect(callback, delay) {
    const timer = setTimeout(() => {
        effectTimers.delete(timer);
        if (isPlaying) callback();
    }, delay);
    effectTimers.add(timer);
    return timer;
}

// ============================================
// DOM Elements
// ============================================
const landingPage = document.getElementById('landing-page');
const playArea = document.getElementById('play-area');
const muteBtn = document.getElementById('mute-btn');
const exitBtn = document.getElementById('exit-btn');
const playControls = document.querySelector('.play-controls');
const batteryBtn = document.getElementById('battery-btn');
const batteryOptions = document.getElementById('battery-options');
const batteryLowScreen = document.getElementById('battery-low-screen');
const batteryRechargeBtn = document.getElementById('battery-recharge-btn');
const soundOnIcon = muteBtn?.querySelector('.sound-on');
const soundOffIcon = muteBtn?.querySelector('.sound-off');

// Game mode elements
const defaultMode = document.getElementById('default-mode');
const animalMode = document.getElementById('animal-mode');
const colorMode = document.getElementById('color-mode');
const bubbleMode = document.getElementById('bubble-mode');
const animationContainer = document.getElementById('animation-container');
const animalLetter = document.getElementById('animal-letter');
const animalEmoji = document.getElementById('animal-emoji');
const animalName = document.getElementById('animal-name');
const animalMobileInput = document.getElementById('animal-mobile-input');
const rainbowCanvas = document.getElementById('rainbow-canvas');
const splashContainer = document.getElementById('splash-container');
const bubbleContainer = document.getElementById('bubble-container');
const bubbleCount = document.getElementById('bubble-count');

// ============================================
// Audio System
// ============================================
function initAudio() {
    if (!audioContext) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return null;
        try {
            audioContext = new Audio();
        } catch (e) {
            return null;
        }
    }
    return audioContext;
}

function playSound(type = 'chime', frequency = null) {
    if (!CONFIG.soundEnabled) return;
    
    try {
        const ctx = initAudio();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Different sound types
        switch(type) {
            case 'bark':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                break;
            case 'meow':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(500, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                break;
            case 'chirp':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                break;
            case 'roar':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                break;
            case 'pop':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                break;
            case 'splash':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(300, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                break;
            default: // chime
                oscillator.type = 'sine';
                const freq = frequency || [261.63, 329.63, 392.00][Math.floor(Math.random() * 3)];
                oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
        };
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playAnimalSound(soundType) {
    const soundMap = {
        'bark': 'bark',
        'meow': 'meow',
        'roar': 'roar',
        'chirp': 'chirp',
        'squeak': 'chirp',
        'hoot': 'chirp',
        'oink': 'bark',
        'neigh': 'roar',
        'hiss': 'chirp',
        'growl': 'roar',
        'trumpet': 'roar',
        'ribbit': 'chirp',
        'howl': 'roar',
        'screech': 'chirp',
        'grunt': 'bark',
        'thump': 'pop',
        'sniff': 'chirp',
        'hum': 'chime'
    };
    playSound(soundMap[soundType] || 'chime');
}

// ============================================
// Utility Functions
// ============================================
function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// ============================================
// Fullscreen API
// ============================================
function enterFullscreen() {
    const elem = document.documentElement;
    const request = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
    try {
        request?.call(elem)?.catch(() => {});
    } catch (e) {
        // Continue playing in the page when fullscreen is unavailable.
    }
}

function exitFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    try {
        exit?.call(document)?.catch(() => {});
    } catch (e) {
        // The browser may already have exited fullscreen.
    }
}

function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

// ============================================
// Mode Management
// ============================================
function hideAllModes() {
    if (defaultMode) defaultMode.classList.add('hidden');
    if (animalMode) animalMode.classList.add('hidden');
    if (colorMode) colorMode.classList.add('hidden');
    if (bubbleMode) bubbleMode.classList.add('hidden');
}

function startMode(mode) {
    if (isPlaying || !['default', 'animal', 'color', 'bubble'].includes(mode)) return;
    returnFocus = document.activeElement;
    currentMode = mode;
    isPlaying = true;
    
    // Hide landing page, show play area
    landingPage.classList.add('hidden');
    playArea.classList.remove('hidden');
    
    // Hide all modes first
    hideAllModes();
    
    // Mobile browsers need a focused text input outside fullscreen for their keyboard.
    const mobileAnimal = mode === 'animal' && isMobileAnimalMode();
    if (!mobileAnimal) enterFullscreen();
    
    // Initialize audio
    initAudio();
    
    // Start specific mode
    switch(mode) {
        case 'default':
            startDefaultMode();
            break;
        case 'animal':
            startAnimalMode();
            break;
        case 'color':
            startColorMode();
            break;
        case 'bubble':
            startBubbleMode();
            break;
    }
    
    // Focus for keyboard events
    if (mobileAnimal) focusAnimalMobileInput();
    else playArea.focus({ preventScroll: true });
}

function clearPlayEffects() {
    effectTimers.forEach(timer => clearTimeout(timer));
    effectTimers.clear();
    document.querySelectorAll('.sparkle-particle, .pop-particle').forEach(el => el.remove());
    
    // Stop bubble spawning
    if (bubbleSpawnInterval) {
        clearInterval(bubbleSpawnInterval);
        bubbleSpawnInterval = null;
    }
    
    // Clear containers
    if (animationContainer) animationContainer.innerHTML = '';
    if (rainbowCanvas) rainbowCanvas.innerHTML = '';
    if (splashContainer) splashContainer.innerHTML = '';
    if (bubbleContainer) bubbleContainer.innerHTML = '';
    
    // Hide mouse follower
    hideMouseFollower();
    
    // Reset bubble score
    bubbleScore = 0;
    if (bubbleCount) bubbleCount.textContent = '0';
}

function closeBatteryOptions() {
    batteryOptions.classList.add('hidden');
    batteryBtn.setAttribute('aria-expanded', 'false');
}

function resetPlayTimer() {
    clearTimeout(playTimer);
    playTimer = null;
    playDeadline = null;
    closeBatteryOptions();
    batteryBtn.setAttribute('aria-label', 'Set play timer');
    batteryBtn.title = 'Set play timer';
    batteryOptions.querySelectorAll('button').forEach(button => {
        button.setAttribute('aria-pressed', 'false');
    });
}

function showBatteryLow() {
    if (!isPlaying) return;
    isPlaying = false;
    isBatteryLow = true;
    resetPlayTimer();
    clearPlayEffects();
    hideAllModes();
    playControls.classList.add('hidden');
    batteryLowScreen.classList.remove('hidden');
    if (audioContext?.state === 'running') audioContext.suspend().catch(() => {});
    batteryLowScreen.focus({ preventScroll: true });
}

function setPlayTimer(minutes) {
    if (!isPlaying || ![2, 5, 10].includes(minutes)) return;
    selectedPlayMinutes = minutes;
    clearTimeout(playTimer);
    playDeadline = Date.now() + minutes * 60 * 1000;
    playTimer = setTimeout(showBatteryLow, minutes * 60 * 1000);
    batteryOptions.querySelectorAll('button').forEach(button => {
        button.setAttribute('aria-pressed', String(Number(button.dataset.minutes) === minutes));
    });
    batteryBtn.setAttribute('aria-label', `Play timer: ${minutes} minutes. Change play timer`);
    batteryBtn.title = `Play timer: ${minutes} minutes`;
    closeBatteryOptions();
    if (currentMode === 'animal' && isMobileAnimalMode()) focusAnimalMobileInput();
    else playArea.focus({ preventScroll: true });
}

function exitPlayMode() {
    if (!isPlaying && !isBatteryLow) return;
    isPlaying = false;
    isBatteryLow = false;
    currentMode = null;
    selectedPlayMinutes = null;
    resetPlayTimer();
    clearPlayEffects();
    batteryLowScreen.classList.add('hidden');
    playControls.classList.remove('hidden');
    
    // Hide play area, show landing
    playArea.classList.add('hidden');
    landingPage.classList.remove('hidden');
    
    // Exit fullscreen
    if (isFullscreen()) exitFullscreen();
    const focusTarget = returnFocus && landingPage.contains(returnFocus) ?
        returnFocus : document.getElementById('start-playing-btn');
    focusTarget?.focus({ preventScroll: true });
    returnFocus = null;
}

function toggleSound() {
    CONFIG.soundEnabled = !CONFIG.soundEnabled;
    if (soundOnIcon) soundOnIcon.classList.toggle('hidden', !CONFIG.soundEnabled);
    if (soundOffIcon) soundOffIcon.classList.toggle('hidden', CONFIG.soundEnabled);
    muteBtn?.setAttribute('aria-pressed', String(!CONFIG.soundEnabled));
    muteBtn?.setAttribute('aria-label', CONFIG.soundEnabled ? 'Mute sound' : 'Unmute sound');
}

// ============================================
// Default Mode (Original shapes + letters)
// ============================================
let mouseFollower = null;
let trailElements = [];
let mouseX = 0;
let mouseY = 0;
let followerX = 0;
let followerY = 0;
let trailPositions = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
];

function startDefaultMode() {
    if (defaultMode) {
        defaultMode.classList.remove('hidden');
        showMouseFollower();
        updateMouseFollower();
    }
}

function getRandomPosition() {
    const padding = Math.min(100, window.innerWidth / 4, window.innerHeight / 4);
    return {
        x: randomInRange(padding, window.innerWidth - padding),
        y: randomInRange(padding, window.innerHeight - padding)
    };
}

function cleanupOldShapes() {
    if (!animationContainer) return;
    const shapes = animationContainer.querySelectorAll('.animation-shape, .floating-letter');
    if (shapes.length > CONFIG.maxShapes) {
        const toRemove = shapes.length - CONFIG.maxShapes;
        for (let i = 0; i < toRemove; i++) {
            shapes[i].remove();
        }
    }
}

function createShape(x, y) {
    if (!animationContainer) return;
    
    const shape = document.createElement('div');
    const shapeType = randomFromArray(CONFIG.shapes);
    const color = randomFromArray(CONFIG.colors);
    const animation = randomFromArray(CONFIG.animations);
    const size = randomInRange(60, 150);
    
    shape.className = `animation-shape shape-${shapeType}`;
    shape.style.cssText = `
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        animation: ${animation} ${CONFIG.shapeDuration}ms ease-out forwards;
    `;
    
    animationContainer.appendChild(shape);
    cleanupOldShapes();
    
    scheduleEffect(() => {
        shape.remove();
    }, CONFIG.shapeDuration);
}

function createFloatingLetter(key, x, y) {
    if (!animationContainer) return;
    
    const letter = document.createElement('div');
    const color = randomFromArray(CONFIG.colors);
    
    let displayChar = key.length === 1 ? key.toUpperCase() : '';
    
    const specialKeys = {
        'space': '○', ' ': '○',
        'enter': '↵', 'tab': '→',
        'backspace': '←', 'arrowup': '↑',
        'arrowdown': '↓', 'arrowleft': '←',
        'arrowright': '→', 'shift': '⬆',
        'control': '◇', 'alt': '◆',
        'escape': '✕', 'capslock': '⬆'
    };
    
    displayChar = specialKeys[key.toLowerCase()] || displayChar;
    if (!displayChar) return;
    
    letter.className = 'floating-letter';
    letter.textContent = displayChar;
    letter.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        color: ${color};
        animation: letter-float ${CONFIG.letterDuration}ms ease-out forwards;
    `;
    
    animationContainer.appendChild(letter);
    cleanupOldShapes();
    
    scheduleEffect(() => {
        letter.remove();
    }, CONFIG.letterDuration);
}

function createBubbles(x, y, count = 5) {
    if (!animationContainer) return;
    
    for (let i = 0; i < count; i++) {
        scheduleEffect(() => {
            const bubble = document.createElement('div');
            const color = randomFromArray(CONFIG.colors);
            const size = randomInRange(20, 50);
            const offsetX = randomInRange(-80, 80);
            const offsetY = randomInRange(-80, 80);
            
            bubble.className = 'animation-shape shape-circle';
            bubble.style.cssText = `
                left: ${x + offsetX - size / 2}px;
                top: ${y + offsetY - size / 2}px;
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                animation: float-up ${randomInRange(1500, 2500)}ms ease-out forwards;
                opacity: 0.8;
            `;
            
            animationContainer.appendChild(bubble);
            cleanupOldShapes();
            
            scheduleEffect(() => {
                bubble.remove();
            }, 2500);
        }, i * 50);
    }
}


function triggerDefaultAnimation(key) {
    const pos = getRandomPosition();
    createShape(pos.x, pos.y);
    createFloatingLetter(key, pos.x - 30, pos.y - 30);
    createBubbles(pos.x, pos.y, Math.floor(randomInRange(3, 7)));
    playSound('chime');
    cleanupOldShapes();
}

// Mouse Follower
function createMouseFollower() {
    mouseFollower = document.createElement('div');
    mouseFollower.className = 'mouse-follower';
    mouseFollower.innerHTML = '<div class="follower-main"></div>';
    document.body.appendChild(mouseFollower);
    
    for (let i = 1; i <= 3; i++) {
        const trail = document.createElement('div');
        trail.className = `follower-trail trail-${i}`;
        document.body.appendChild(trail);
        trailElements.push(trail);
    }
}

function updateMouseFollower() {
    if (followerFrame !== null) cancelAnimationFrame(followerFrame);
    followerFrame = null;
    if (!mouseFollower || !isPlaying || currentMode !== 'default' || reducedMotion.matches || document.hidden) return;
    
    const ease = 0.15;
    followerX += (mouseX - followerX) * ease;
    followerY += (mouseY - followerY) * ease;
    
    mouseFollower.style.transform = `translate(${followerX - 25}px, ${followerY - 25}px)`;
    
    trailPositions[0].x += (followerX - trailPositions[0].x) * 0.12;
    trailPositions[0].y += (followerY - trailPositions[0].y) * 0.12;
    
    trailPositions[1].x += (trailPositions[0].x - trailPositions[1].x) * 0.1;
    trailPositions[1].y += (trailPositions[0].y - trailPositions[1].y) * 0.1;
    
    trailPositions[2].x += (trailPositions[1].x - trailPositions[2].x) * 0.08;
    trailPositions[2].y += (trailPositions[1].y - trailPositions[2].y) * 0.08;
    
    trailElements.forEach((trail, i) => {
        const offset = (i + 1) * 15;
        trail.style.transform = `translate(${trailPositions[i].x - (12 - i * 3)}px, ${trailPositions[i].y + offset - (12 - i * 3)}px)`;
    });
    
    followerFrame = requestAnimationFrame(updateMouseFollower);
}

function showMouseFollower() {
    if (mouseFollower) {
        mouseFollower.style.display = 'block';
        trailElements.forEach(trail => trail.style.display = 'block');
    }
}

function hideMouseFollower() {
    if (followerFrame !== null) cancelAnimationFrame(followerFrame);
    followerFrame = null;
    if (mouseFollower) {
        mouseFollower.style.display = 'none';
        trailElements.forEach(trail => trail.style.display = 'none');
    }
}

function createClickSparkles(x, y) {
    const sparkleColors = ['#FFDDE1', '#C5DEF5', '#D4EED4', '#FFF3D6', '#FFD4CC', '#E6DDED'];
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 30 + Math.random() * 20;
        const sparkleX = Math.cos(angle) * distance;
        const sparkleY = Math.sin(angle) * distance;
        
        sparkle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            background: ${sparkleColors[Math.floor(Math.random() * sparkleColors.length)]};
            --sparkle-x: ${sparkleX}px;
            --sparkle-y: ${sparkleY}px;
        `;
        
        playArea.appendChild(sparkle);
        scheduleEffect(() => sparkle.remove(), 600);
    }
}

// ============================================
// Animal Mode
// ============================================
function isMobileAnimalMode() {
    return window.matchMedia('(any-pointer: coarse), (max-width: 768px)').matches;
}

function focusAnimalMobileInput() {
    animalMobileInput.value = '';
    animalMobileInput.focus({ preventScroll: true });
}

function handleAnimalMobileInput(event) {
    if (event.isComposing || !isPlaying || currentMode !== 'animal') return;
    const letters = animalMobileInput.value.match(/[a-z]/gi);
    if (letters?.length) handleAnimalKeyPress(letters[letters.length - 1]);
    animalMobileInput.value = '';
}

animalMobileInput.addEventListener('input', handleAnimalMobileInput);
animalMobileInput.addEventListener('compositionend', handleAnimalMobileInput);
// Tapping the animal reopens the keyboard if it was dismissed.
animalMode.addEventListener('click', () => {
    if (isPlaying && currentMode === 'animal' && isMobileAnimalMode()) focusAnimalMobileInput();
});

function startAnimalMode() {
    if (animalMode) {
        animalMode.classList.remove('hidden');
        // Show default animal
        updateAnimalDisplay('a');
    }
}

function updateAnimalDisplay(key) {
    const animal = ANIMALS[key.toLowerCase()];
    if (!animal) return false;

    // Update display with animation
    if (animalLetter) {
        animalLetter.textContent = key.toUpperCase();
        animalLetter.style.animation = 'none';
        animalLetter.offsetHeight; // Trigger reflow
        animalLetter.style.animation = 'letterPop 0.4s ease-out';
    }
    
    if (animalEmoji) {
        animalEmoji.textContent = animal.emoji;
        animalEmoji.style.animation = 'none';
        animalEmoji.offsetHeight;
        animalEmoji.style.animation = 'animalBounce 0.6s ease-out';
    }
    
    if (animalName) {
        animalName.textContent = animal.name;
        animalName.style.animation = 'none';
        animalName.offsetHeight;
        animalName.style.animation = 'nameSlide 0.5s ease-out';
    }
    
    // Play animal sound
    playAnimalSound(animal.sound);
    
    return true;
}

function handleAnimalKeyPress(key) {
    if (key.length === 1 && /[a-zA-Z]/.test(key)) {
        updateAnimalDisplay(key);
    } else {
        // For non-letter keys, play a chime
        playSound('chime');
    }
}

// ============================================
// Color Splash Mode
// ============================================
function startColorMode() {
    if (colorMode) {
        colorMode.classList.remove('hidden');
    }
}

function changeBackgroundColor() {
    if (!colorMode) return;
    const color = randomFromArray(CONFIG.colors);
    colorMode.style.background = `linear-gradient(135deg, ${color} 0%, ${randomFromArray(CONFIG.colors)} 100%)`;
    playSound('splash');
}

function createRainbowDot(x, y) {
    if (!rainbowCanvas) return;
    
    const dot = document.createElement('div');
    dot.className = 'rainbow-dot';
    const size = randomInRange(8, 20);
    const color = randomFromArray(CONFIG.rainbowColors);
    
    dot.style.cssText = `
        left: ${x - size/2}px;
        top: ${y - size/2}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        box-shadow: 0 0 ${size}px ${color};
    `;
    
    rainbowCanvas.appendChild(dot);
    
    // Remove after animation
    scheduleEffect(() => dot.remove(), 1000);
    
    // Cleanup old dots
    const dots = rainbowCanvas.querySelectorAll('.rainbow-dot');
    if (dots.length > 100) {
        for (let i = 0; i < 20; i++) dots[i].remove();
    }
}

function createSplashEffect(x, y) {
    if (!splashContainer) return;
    
    const color = randomFromArray(CONFIG.rainbowColors);
    
    // Main splash circle
    const splash = document.createElement('div');
    splash.className = 'splash-effect';
    splash.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, ${color} 0%, transparent 70%);
    `;
    splashContainer.appendChild(splash);
    
    // Multiple expanding rings
    for (let i = 0; i < 3; i++) {
        scheduleEffect(() => {
            const ring = document.createElement('div');
            ring.className = 'splash-ring';
            ring.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: ${60 + i * 30}px;
                height: ${60 + i * 30}px;
                border-color: ${randomFromArray(CONFIG.rainbowColors)};
            `;
            splashContainer.appendChild(ring);
            scheduleEffect(() => ring.remove(), 600);
        }, i * 100);
    }
    
    playSound('splash');
    scheduleEffect(() => splash.remove(), 800);
}

// ============================================
// Bubble Pop Mode
// ============================================
function startBubbleMode() {
    if (bubbleMode) {
        bubbleMode.classList.remove('hidden');
        bubbleScore = 0;
        if (bubbleCount) bubbleCount.textContent = '0';
        
        // Start spawning bubbles
        spawnBubble();
        bubbleSpawnInterval = setInterval(spawnBubble, CONFIG.bubbleInterval);
    }
}

function spawnBubble() {
    if (!bubbleContainer || !isPlaying || document.hidden || currentMode !== 'bubble') return;
    
    // Limit max bubbles
    const bubbles = bubbleContainer.querySelectorAll('.bubble');
    if (bubbles.length >= CONFIG.maxBubbles) return;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.setAttribute('role', 'button');
    bubble.setAttribute('tabindex', '0');
    bubble.setAttribute('aria-label', 'Pop bubble');
    
    const size = randomInRange(50, 120);
    const x = randomInRange(0, Math.max(0, window.innerWidth - size));
    const duration = randomInRange(6, 12);
    
    bubble.style.cssText = `
        left: ${x}px;
        bottom: -${size}px;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${duration}s;
    `;
    if (reducedMotion.matches) {
        bubble.style.bottom = `${randomInRange(15, 65)}%`;
    }
    
    // Click handler for popping
    bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        popBubble(bubble);
    });
    
    bubbleContainer.appendChild(bubble);
    
    // Remove bubble when it floats off screen
    scheduleEffect(() => {
        if (bubble.parentNode) bubble.remove();
    }, duration * 1000);
}

function popBubble(bubble) {
    if (!isPlaying || currentMode !== 'bubble' || bubble.classList.contains('bubble-pop')) return;
    
    // Get position for particles
    const rect = bubble.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Add pop animation
    bubble.classList.add('bubble-pop');
    bubble.setAttribute('tabindex', '-1');
    bubble.setAttribute('aria-disabled', 'true');
    if (document.activeElement === bubble) playArea.focus({ preventScroll: true });
    
    // Create pop particles
    createPopParticles(x, y);
    
    // Play pop sound
    playSound('pop');
    
    // Update score
    bubbleScore++;
    if (bubbleCount) {
        bubbleCount.textContent = bubbleScore;
        // Score pop animation
        const scoreEl = document.querySelector('.bubble-score');
        if (scoreEl) {
            scoreEl.classList.remove('score-pop');
            scoreEl.offsetHeight;
            scoreEl.classList.add('score-pop');
        }
    }
    
    // Remove bubble after animation
    scheduleEffect(() => bubble.remove(), 300);
}

function createPopParticles(x, y) {
    const colors = ['#C5DEF5', '#D4EED4', '#FFDDE1', '#FFF3D6', '#E6DDED'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'pop-particle';
        
        const angle = (i / 8) * Math.PI * 2;
        const distance = randomInRange(40, 80);
        const px = Math.cos(angle) * distance;
        const py = Math.sin(angle) * distance;
        
        particle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            background: ${randomFromArray(colors)};
            --x: ${px}px;
            --y: ${py}px;
        `;
        
        playArea.appendChild(particle);
        scheduleEffect(() => particle.remove(), 500);
    }
}

// ============================================
// Event Listeners
// ============================================

// Mode selection - Play Now buttons
document.addEventListener('DOMContentLoaded', () => {
    // Create mouse follower
    createMouseFollower();
    hideMouseFollower();
    
    // Play now buttons
    const playNowBtns = document.querySelectorAll('.play-now-btn');
    playNowBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const mode = btn.dataset.mode;
            if (mode) startMode(mode);
        });
    });
    
    // Mode cards (click anywhere on card)
    const modeCards = document.querySelectorAll('.mode-card[data-mode]');
    modeCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking the button (it has its own handler)
            if (e.target.closest('.play-now-btn')) return;
            const mode = card.dataset.mode;
            if (mode) startMode(mode);
        });
    });
    
    // Start Playing button - directly enters default play mode
    const startBtn = document.getElementById('start-playing-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startMode('default');
        });
    }
    
    // Native anchors retain URL hashes, keyboard behavior and CSS smooth scrolling.
});

// Mute button
if (muteBtn) {
    muteBtn.addEventListener('click', toggleSound);
}

// Exit button
if (exitBtn) {
    exitBtn.addEventListener('click', exitPlayMode);
}

// Keyboard input
batteryBtn.addEventListener('click', () => {
    if (!isPlaying) return;
    const opening = batteryOptions.classList.contains('hidden');
    batteryOptions.classList.toggle('hidden', !opening);
    batteryBtn.setAttribute('aria-expanded', String(opening));
    if (opening) batteryOptions.querySelector('button').focus();
});

batteryOptions.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => setPlayTimer(Number(button.dataset.minutes)));
});

batteryRechargeBtn.addEventListener('click', exitPlayMode);

document.addEventListener('click', (e) => {
    if (!e.target.closest('.battery-control')) closeBatteryOptions();
});

document.addEventListener('keydown', (e) => {
    if (isBatteryLow) {
        if (e.key === 'Escape') exitPlayMode();
        else if (!e.target.closest('#battery-recharge-btn') && !['Tab', 'F11', 'F12'].includes(e.key)) e.preventDefault();
        return;
    }
    if (!isPlaying) return;
    
    // ESC to exit
    if (e.key === 'Escape') {
        if (!batteryOptions.classList.contains('hidden')) {
            closeBatteryOptions();
            batteryBtn.focus();
            return;
        }
        exitPlayMode();
        return;
    }
    // Native keyboards deliver letters through input events, not reliably through keydown.
    if (e.target === animalMobileInput && e.key !== 'Tab') return;
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.play-controls')) return;
    const focusedBubble = e.target.closest('.bubble');
    if (focusedBubble && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        if (!e.repeat) popBubble(focusedBubble);
        return;
    }
    
    // Prevent default for most keys
    const allowedKeys = ['F11', 'F12'];
    if (!allowedKeys.includes(e.key)) {
        e.preventDefault();
    }
    if (allowedKeys.includes(e.key)) return;
    
    // Handle based on current mode
    switch(currentMode) {
        case 'default':
            triggerDefaultAnimation(e.key);
            break;
        case 'animal':
            handleAnimalKeyPress(e.key);
            break;
        case 'color':
            changeBackgroundColor();
            break;
        case 'bubble':
            // Keys can spawn extra bubbles
            playSound('chime');
            spawnBubble();
            break;
    }
});

document.addEventListener('keydown', () => {
    document.querySelector('.play-hint')?.classList.add('hidden');
}, { once: true });

// Mouse move
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!isPlaying) return;
    
    if (currentMode === 'color') {
        createRainbowDot(e.clientX, e.clientY);
    }
});

// Click handler
document.addEventListener('click', (e) => {
    if (!isPlaying) return;
    
    // Don't trigger on control buttons
    if (e.target.closest('.play-controls')) return;
    if (e.target.closest('#battery-low-screen')) return;
    if (e.target.closest('#landing-page')) return;
    
    if (currentMode === 'default') {
        createShape(e.clientX, e.clientY);
        createBubbles(e.clientX, e.clientY, 4);
        createClickSparkles(e.clientX, e.clientY);
        playSound('chime');
    } else if (currentMode === 'color') {
        createSplashEffect(e.clientX, e.clientY);
    }
});

// Touch events for mobile
document.addEventListener('touchstart', (e) => {
    if (!isPlaying) return;
    
    // Don't prevent on controls
    if (e.target.closest('.play-controls')) return;
    // Let the browser synthesize clicks for bubbles and animal mode.
    if (currentMode === 'bubble' || currentMode === 'animal') return;
    
    e.preventDefault();
    
    for (let touch of e.changedTouches) {
        if (currentMode === 'default') {
            createShape(touch.clientX, touch.clientY);
            createBubbles(touch.clientX, touch.clientY, 4);
            createClickSparkles(touch.clientX, touch.clientY);
            playSound('chime');
        } else if (currentMode === 'color') {
            createSplashEffect(touch.clientX, touch.clientY);
        }
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (!isPlaying) return;
    
    for (let touch of e.touches) {
        if (currentMode === 'color') {
            createRainbowDot(touch.clientX, touch.clientY);
        }
    }
}, { passive: true });

// Prevent context menu in play mode
document.addEventListener('contextmenu', (e) => {
    if (isPlaying) e.preventDefault();
});

// Cleanup on visibility change
document.addEventListener('visibilitychange', () => {
    // Enforce elapsed time when returning from a background tab or sleeping device.
    if (!document.hidden && isPlaying && playDeadline !== null && Date.now() >= playDeadline) {
        showBatteryLow();
    }
    if (document.hidden && followerFrame !== null) {
        cancelAnimationFrame(followerFrame);
        followerFrame = null;
    } else if (!document.hidden && isPlaying && currentMode === 'default') {
        updateMouseFollower();
    }
    if (document.hidden && isPlaying) {
        // Pause bubble spawning when tab is hidden
        if (bubbleSpawnInterval) {
            clearInterval(bubbleSpawnInterval);
            bubbleSpawnInterval = null;
        }
    } else if (!document.hidden && isPlaying && currentMode === 'bubble') {
        // Resume bubble spawning
        if (!bubbleSpawnInterval) {
            bubbleSpawnInterval = setInterval(spawnBubble, CONFIG.bubbleInterval);
        }
    }
});

reducedMotion.addEventListener('change', () => {
    if (isPlaying && currentMode === 'default') updateMouseFollower();
    if (isPlaying && currentMode === 'bubble') {
        bubbleContainer.replaceChildren();
        spawnBubble();
    }
});

// ============================================
// Static illustrative activity map
// No real-time analytics or geolocation is collected here.
// ============================================
function initCommunityMap() {
    const markers = document.getElementById('activity-map-markers');
    const locationList = document.getElementById('activity-location-list');
    if (!markers || !locationList) return;

    const locations = [
        { name: 'New York, USA', lat: 40.7, lon: -74 },
        { name: 'San Francisco, USA', lat: 37.8, lon: -122.4 },
        { name: 'Toronto, Canada', lat: 43.7, lon: -79.4 },
        { name: 'Mexico City, Mexico', lat: 19.4, lon: -99.1 },
        { name: 'São Paulo, Brazil', lat: -23.6, lon: -46.6 },
        { name: 'London, UK', lat: 51.5, lon: -0.1 },
        { name: 'Paris, France', lat: 48.9, lon: 2.4 },
        { name: 'Berlin, Germany', lat: 52.5, lon: 13.4 },
         { name: 'Lagos, Nigeria', lat: 6.5, lon: 3.4 },
        { name: 'Cape Town, South Africa', lat: -33.9, lon: 18.4 },
        { name: 'Dubai, UAE', lat: 25.2, lon: 55.3 },
        { name: 'Mumbai, India', lat: 19.1, lon: 72.9 },
        { name: 'Bengaluru, India', lat: 13, lon: 77.6 },
        { name: 'Singapore', lat: 1.4, lon: 103.8 },
        { name: 'Tokyo, Japan', lat: 35.7, lon: 139.7 },
        { name: 'Seoul, South Korea', lat: 37.6, lon: 127 },
        { name: 'Sydney, Australia', lat: -33.9, lon: 151.2 },
        { name: 'Auckland, New Zealand', lat: -36.8, lon: 174.8 }
    ];

    // Fisher–Yates shuffle: generate a fresh illustration once per page load.
    for (let i = locations.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [locations[i], locations[j]] = [locations[j], locations[i]];
    }
    const illustratedLocations = locations.slice(0, 6 + Math.floor(Math.random() * 4));
    const svgNS = 'http://www.w3.org/2000/svg';
    let total = 0;
    markers.replaceChildren();
    locationList.replaceChildren();

    illustratedLocations.forEach(location => {
        const players = 12 + Math.floor(Math.random() * 85);
        total += players;
        const marker = document.createElementNS(svgNS, 'g');
        const title = document.createElementNS(svgNS, 'title');
        title.textContent = `${location.name}: ${players} demo players`;
        marker.appendChild(title);
        [
            { radius: 15, className: 'map-marker-halo' },
            { radius: 6, className: 'map-marker-dot' }
        ].forEach(({ radius, className }) => {
            const circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', ((location.lon + 180) / 360 * 1000).toFixed(1));
            circle.setAttribute('cy', ((90 - location.lat) / 180 * 500).toFixed(1));
            circle.setAttribute('r', radius);
            circle.setAttribute('class', className);
            marker.appendChild(circle);
        });
        markers.appendChild(marker);

        const item = document.createElement('li');
        item.textContent = `${location.name} · ${players}`;
        locationList.appendChild(item);
    });

    document.getElementById('demo-user-count').textContent = total.toLocaleString();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommunityMap, { once: true });
} else {
    initCommunityMap();
}

// Log ready
console.log('🎨 KeySafari loaded! Ready for joyful play.');

