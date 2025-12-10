/**
 * StreamElements Goal Widget - Widget 1 (Full Circle)
 * Works in both local development and StreamElements overlay
 */

// ============================================
// STATE
// ============================================
let settings = {};
let currentProgress = 0;
let goalTarget = 100;
let isDevMode = false;

// ============================================
// INITIALIZATION
// ============================================

// Detect environment and initialize
(function init() {
  // Check if we're in StreamElements (SE_API exists) or local dev
  if (typeof SE_API !== 'undefined') {
    // StreamElements environment - wait for widget load event
    console.log('[Widget] Running in StreamElements mode');
    isDevMode = false;
  } else {
    // Local development - mock SE_API and auto-initialize
    console.log('[Widget] Running in DEV mode');
    isDevMode = true;
    mockStreamElements();
    initDevMode();
  }
})();

// Mock StreamElements API for local development
function mockStreamElements() {
  window.SE_API = {
    store: {
      _data: {},
      get: function (key) {
        return Promise.resolve(this._data[key] || null);
      },
      set: function (key, value) {
        this._data[key] = value;
        console.log('[Store]', key, '=', value);
        return Promise.resolve();
      }
    }
  };
}

// Initialize dev mode UI and trigger widget load
function initDevMode() {
  document.body.classList.add('dev-mode');
  document.getElementById('dev-controls').classList.remove('hidden');

  // Bind dev control events
  document.getElementById('dev-appearance').addEventListener('change', updateFromDevControls);
  document.getElementById('dev-primary').addEventListener('input', updateFromDevControls);
  document.getElementById('dev-secondary').addEventListener('input', updateFromDevControls);
  document.getElementById('dev-title').addEventListener('input', updateFromDevControls);
  document.getElementById('dev-goal').addEventListener('input', updateFromDevControls);

  // Simulate widget load with default settings
  const mockFieldData = getDevSettings();
  triggerWidgetLoad(mockFieldData);
}

// Get settings from dev controls
function getDevSettings() {
  return {
    appearanceMode: document.getElementById('dev-appearance')?.value || 'gradient_neon',
    primaryColor: document.getElementById('dev-primary')?.value || '#ff2d95',
    secondaryColor: document.getElementById('dev-secondary')?.value || '#a855f7',
    bgTrackColor: '#5a5a5a',
    glowColor: 'rgba(255, 45, 149, 0.8)',
    textColor: '#ffffff',
    titleText: document.getElementById('dev-title')?.value || 'SUBSCRIPTIONS',
    fontFamily: 'Poppins, sans-serif',
    titleSize: 28,
    fontSizeValue: 48,
    imageUrl: '',
    imageShape: 'none',
    goalValue: parseInt(document.getElementById('dev-goal')?.value) || 100,
    startingProgress: 65,
    eventType: 'subscriber',
    progressIncrementUnit: 1,
    stopAtGoal: false,
    resetAtGoal: false,
    increaseAfterGoalBy: 0,
    enableChatCommands: true,
    enableGlow: true,
    useGradient: true,
    size: 420
  };
}

// Trigger the widget load event (mimics StreamElements)
function triggerWidgetLoad(fieldData) {
  const event = new CustomEvent('onWidgetLoad', {
    detail: {
      fieldData: fieldData,
      session: { data: {} }
    }
  });
  window.dispatchEvent(event);
}

// Update from dev controls (live preview)
function updateFromDevControls() {
  const newSettings = getDevSettings();
  settings = newSettings;
  goalTarget = newSettings.goalValue;
  applyStyles();
  updateUI(false);
}

// ============================================
// STREAMELEMENTS EVENT HANDLERS
// ============================================

window.addEventListener('onWidgetLoad', function (obj) {
  const data = obj.detail.fieldData;
  settings = data;

  // Initialize values
  goalTarget = data.goalValue || 100;
  currentProgress = data.startingProgress || 0;

  // Try to restore from persistent storage
  SE_API.store.get('goal_current').then(val => {
    if (val !== null && val !== undefined) {
      currentProgress = parseFloat(val);
    }
    applyStyles();
    initializeCircles();
    updateUI(false);
  });
});

window.addEventListener('onEventReceived', function (obj) {
  if (!obj.detail.event) return;

  const listener = obj.detail.listener;
  const event = obj.detail.event;

  // Handle chat commands
  if (listener === 'message' && settings.enableChatCommands) {
    handleChatCommand(event.data);
    return;
  }

  // Handle goal events
  let amountToAdd = 0;

  if (settings.eventType === 'follower' && listener === 'follower-latest') {
    amountToAdd = settings.progressIncrementUnit || 1;
  } else if (settings.eventType === 'subscriber' && listener === 'subscriber-latest') {
    amountToAdd = settings.progressIncrementUnit || 1;
  } else if (settings.eventType === 'donation' && listener === 'tip-latest') {
    amountToAdd = event.amount || 0;
  } else if (settings.eventType === 'cheer' && listener === 'cheer-latest') {
    amountToAdd = event.amount || 0;
  }

  if (amountToAdd > 0) {
    addProgress(amountToAdd);
  }
});

// ============================================
// CORE LOGIC
// ============================================

function addProgress(amount) {
  if (settings.stopAtGoal && currentProgress >= goalTarget) return;

  currentProgress += amount;

  // Goal reached logic
  if (currentProgress >= goalTarget) {
    celebrate();

    if (settings.increaseAfterGoalBy > 0) {
      goalTarget += settings.increaseAfterGoalBy;
    } else if (settings.resetAtGoal) {
      currentProgress = 0;
    }
  }

  saveState();
  updateUI(true);
}

function saveState() {
  SE_API.store.set('goal_current', currentProgress);
}

// ============================================
// RENDERING
// ============================================

function applyStyles() {
  const root = document.documentElement;
  const widget = document.getElementById('goal-widget');

  // Apply CSS variables
  root.style.setProperty('--primary-color', settings.primaryColor);
  root.style.setProperty('--secondary-color', settings.secondaryColor);
  root.style.setProperty('--bg-track-color', settings.bgTrackColor || '#5a5a5a');
  root.style.setProperty('--glow-color', settings.glowColor || settings.primaryColor);
  root.style.setProperty('--text-color', settings.textColor || '#ffffff');
  root.style.setProperty('--widget-size', (settings.size || 420) + 'px');

  // Update gradient stops
  document.getElementById('grad-stop-1').setAttribute('stop-color', settings.primaryColor);
  document.getElementById('grad-stop-2').setAttribute('stop-color', settings.secondaryColor);

  // Apply appearance classes
  widget.classList.remove('appearance-solid', 'appearance-neon', 'use-gradient');

  if (settings.appearanceMode === 'gradient_neon') {
    widget.classList.add('appearance-neon', 'use-gradient');
  } else {
    widget.classList.add('appearance-solid');
  }

  // Update title
  document.getElementById('widget-title').textContent = settings.titleText || 'SUBSCRIPTIONS';
  document.getElementById('widget-title').style.color = settings.primaryColor;

  // Handle center image
  const centerImage = document.getElementById('center-image');
  const centerText = document.getElementById('center-text');

  if (settings.imageUrl && settings.imageShape !== 'none') {
    centerImage.style.backgroundImage = `url(${settings.imageUrl})`;
    centerImage.classList.remove('hidden');
    centerText.classList.add('hidden');
  } else {
    centerImage.classList.add('hidden');
    centerText.classList.remove('hidden');
  }
}

function initializeCircles() {
  const radius = 190;
  const circumference = 2 * Math.PI * radius;

  const track = document.getElementById('track-circle');
  const progress = document.getElementById('progress-circle');
  const glow = document.getElementById('glow-circle');

  // Set dasharray to full circumference
  [track, progress, glow].forEach(circle => {
    circle.style.strokeDasharray = circumference;
  });

  // Track is always fully visible
  track.style.strokeDashoffset = 0;

  // Progress and glow start empty
  progress.style.strokeDashoffset = circumference;
  glow.style.strokeDashoffset = circumference;
}

function updateUI(animate) {
  const radius = 190;
  const circumference = 2 * Math.PI * radius;

  // Calculate percentage
  const percent = Math.min(currentProgress / goalTarget, 1);
  const offset = circumference * (1 - percent);

  // Update circles
  const progress = document.getElementById('progress-circle');
  const glow = document.getElementById('glow-circle');

  if (!animate) {
    progress.style.transition = 'none';
    glow.style.transition = 'none';
  } else {
    progress.style.transition = 'stroke-dashoffset 0.5s ease-out';
    glow.style.transition = 'stroke-dashoffset 0.5s ease-out';
  }

  progress.style.strokeDashoffset = offset;
  glow.style.strokeDashoffset = offset;

  // Force reflow if no animation
  if (!animate) {
    progress.getBoundingClientRect();
    glow.getBoundingClientRect();
  }

  // Update text values
  const percentValue = Math.floor(percent * 100);
  document.getElementById('percent-text').textContent = percentValue + '%';
  document.getElementById('current-val').textContent = Math.floor(currentProgress);
  document.getElementById('goal-val').textContent = Math.floor(goalTarget);
}

function celebrate() {
  const widget = document.getElementById('goal-widget');
  widget.classList.add('celebrating');

  setTimeout(() => {
    widget.classList.remove('celebrating');
  }, 1000);
}

// ============================================
// CHAT COMMANDS
// ============================================

function handleChatCommand(data) {
  if (!data) return;

  // Check permissions
  const isBroadcaster = data.nick === data.channel;
  const isMod = data.tags && data.tags.mod === '1';

  if (!isBroadcaster && !isMod) {
    console.log('[Chat] Unauthorized command attempt from:', data.nick);
    return;
  }

  const text = (data.text || '').trim();
  const parts = text.split(' ');
  const cmd = parts[0].toLowerCase();
  const arg = parseFloat(parts[1]);

  switch (cmd) {
    case '!add':
      if (!isNaN(arg)) addProgress(arg);
      break;
    case '!subtract':
      if (!isNaN(arg)) addProgress(-arg);
      break;
    case '!setprogress':
      if (!isNaN(arg)) {
        currentProgress = arg;
        saveState();
        updateUI(true);
      }
      break;
    case '!setgoal':
      if (!isNaN(arg)) {
        goalTarget = arg;
        saveState();
        updateUI(true);
      }
      break;
    case '!resetgoal':
      currentProgress = 0;
      saveState();
      updateUI(true);
      break;
  }
}

// ============================================
// DEV MODE HELPERS (Global for onclick)
// ============================================

window.devAddProgress = function (amount) {
  addProgress(amount);
};

window.devReset = function () {
  currentProgress = 0;
  saveState();
  updateUI(true);
};

window.devComplete = function () {
  currentProgress = goalTarget;
  saveState();
  updateUI(true);
  celebrate();
};
