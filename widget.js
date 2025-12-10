let settings = {};
let currentProgress = 0;
let goalTarget = 100;
let sessionAdded = 0;

// Connect to StreamElements
window.addEventListener('onWidgetLoad', function (obj) {
  const data = obj.detail.fieldData;
  settings = data;
  
  // 1. Initialize State (Load from Store or defaults)
  const storeCurrent = obj.detail.session.data['goal_current']; // legacy session?
  // Proper SE Store usage:
  // Note: SE_API.store.get is async but onWidgetLoad is sync. 
  // We rely on initial values and then maybe fetch? 
  // Actually, standard widgets use 'goal_current' from session if available, 
  // but "SE_API.store" is the modern persistent way.
  
  // Initialize with Defaults
  goalTarget = data.goalValue;
  currentProgress = data.startingProgress; // overrides if set
  
  // Check for persistence override
  SE_API.store.get('goal_current').then(val => {
    if (val !== null && val !== undefined) {
      currentProgress = parseFloat(val);
      updateUI(false); // No animation on load
    }
  });

  // Apply Styles (Colors, Fonts, Layouts)
  initStyles();
  
  // Draw the SVG Path based on Widget Mode
  drawPaths();
  
  // Initial Render
  updateUI(false);
  
  if (settings.showDebugButtons) {
    document.getElementById('debug-controls').classList.remove('hidden');
  }
});

window.addEventListener('onEventReceived', function (obj) {
  if (!obj.detail.event) return;
  const listener = obj.detail.listener;
  const event = obj.detail.event;
  
  // 1. Handle Chat Commands
  if (listener === 'message' && settings.enableChatCommands) {
    handleChatCommand(event.data);
    return;
  }
  
  // 2. Handle Goal Events
  let amountToAdd = 0;
  
  // Check if event matches selected type
  if (settings.eventType === 'follower' && listener === 'follower-latest') {
    amountToAdd = settings.progressIncrementUnit;
  } else if (settings.eventType === 'subscriber' && listener === 'subscriber-latest') {
    amountToAdd = settings.progressIncrementUnit;
  } else if (settings.eventType === 'donation' && listener === 'tip-latest') {
    amountToAdd = event.amount;
  } else if (settings.eventType === 'cheer' && listener === 'cheer-latest') {
    amountToAdd = event.amount; // Cheers usually 1 bit = 1 cent? Or raw bits? Usually amount=bits.
    // User might want bits to dollars. Assuming raw amount for now.
  } else if (settings.eventType === 'custom' && listener === 'kv-store-update') {
    // Custom handling if needed
  }
  
  if (amountToAdd > 0) {
    addProgress(amountToAdd);
  }
});

// --- Core Logic ---

function addProgress(amount) {
  if (settings.stopAtGoal && currentProgress >= goalTarget) return;

  currentProgress += amount;
  
  // Logic: Reached Goal
  if (currentProgress >= goalTarget) {
    if (settings.increaseAfterGoalBy > 0) {
      goalTarget += settings.increaseAfterGoalBy;
      // Persist new goal? 
      // In this simple version we don't persist dynamic goal changes to widget.json, 
      // but we should persist to store if we want it to survive reload.
      // We'll leave it in memory for now or use store.
    } else if (settings.resetAtGoal) {
      currentProgress = 0;
      // Trigger celebration before reset?
      celebrate();
    } else {
      celebrate();
    }
  }
  
  saveState();
  updateUI(true);
}

function updateUI(animate) {
  // Update Text
  document.getElementById('current-val').innerText = Math.floor(currentProgress);
  document.getElementById('goal-val').innerText = Math.floor(goalTarget);
  
  const percent = Math.min(currentProgress / goalTarget, 1);
  const percentText = Math.floor((currentProgress / goalTarget) * 100) + '%';
  document.getElementById('percent-text').innerText = percentText;
  
  // Update Arc
  const path = document.getElementById('progress-path');
  const glow = document.getElementById('progress-glow');
  const totalLength = path.getTotalLength();
  
  // Calculate offset
  // DashArray is set to "Total, Total"
  // Offset = Total * (1 - percent)
  const offset = totalLength * (1 - percent);
  
  path.style.strokeDashoffset = offset;
  glow.style.strokeDashoffset = offset;
}

function saveState() {
  SE_API.store.set('goal_current', currentProgress);
}

// --- Layout & Drawing ---

function initStyles() {
  const root = document.documentElement;
  const widget = document.getElementById('goal-widget');
  
  // CSS Vars
  root.style.setProperty('--widget-size', settings.size + 'px');
  root.style.setProperty('--primary-color', settings.primaryColor);
  root.style.setProperty('--secondary-color', settings.secondaryColor);
  root.style.setProperty('--bg-track-color', settings.bgTrackColor);
  root.style.setProperty('--glow-color', settings.glowColor);
  root.style.setProperty('--text-color', settings.textColor);
  root.style.setProperty('--font-family', settings.fontFamily);
  root.style.setProperty('--title-size', settings.titleSize + 'px');
  root.style.setProperty('--value-size', settings.fontSizeValue + 'px');
  
  // Layout Classes
  widget.className = ''; // reset
  widget.classList.add('style-' + settings.styleMode);
  widget.classList.add('appearance-' + settings.appearanceMode);
  
  if (settings.useGradient) widget.classList.add('use-gradient');
  
  // Elements
  document.getElementById('widget-title').innerText = settings.titleText;
  
  // Image
  const img = document.getElementById('center-image');
  if (settings.imageUrl && settings.imageShape !== 'none') {
    img.style.backgroundImage = `url(${settings.imageUrl})`;
    img.classList.remove('hidden');
    img.classList.add('shape-' + settings.imageShape);
    // Hide text in center if image exists? 
    // Widget 1 usually keeps text. Widget 2 keeps image. 
    // We let CSS control defaults or use user pref.
  } else {
    img.classList.add('hidden');
  }
  
  // Gradient Definition
  const grad = document.getElementById('main-gradient');
  grad.innerHTML = `
    <stop offset="0%" stop-color="${settings.primaryColor}"/>
    <stop offset="100%" stop-color="${settings.secondaryColor}"/>
  `;
  
  // Glow Toggle
  document.getElementById('progress-glow').style.display = settings.enableGlow ? 'block' : 'none';
}

function drawPaths() {
  const mode = settings.styleMode;
  /*
    SVG Coordinate System: 0..500
    Center: 250, 250
    Radius: 200 (leaving 50px padding for stroke/glow)
  */
  const cx = 250;
  const cy = 250;
  const r = 200;
  
  let d = '';
  
  if (mode === 'widget1' || mode === 'widget2') {
    // Full Circle, start at top (-90 deg)
    d = describeArc(cx, cy, r, 0, 359.9);
    // Rotate entire SVG or Path to start at top?
    // describeArc 0 is at 12 o'clock? No, usually 3.
    // We can just use a standard circle path starting at Top (0, -r relative)
    // M 250,50 A 200,200 0 1,1 249.9,50
    d = describeArc(cx, cy, r, 0, 359.99); 
    // We will rotate the path using transform in CSS or attr
    document.getElementById('track-path').setAttribute('transform', 'rotate(-90 250 250)');
    document.getElementById('progress-path').setAttribute('transform', 'rotate(-90 250 250)');
    document.getElementById('progress-glow').setAttribute('transform', 'rotate(-90 250 250)');
  } else if (mode === 'widget3') {
    // Arch (Semi-circle)
    // Start Left (270 if 0 is top? No, 180 is left).
    // Let's assume standard 0=3oclock.
    // Start 180 (9 oclock) -> End 0 (3 oclock). Sweep -180?
    // Clockwise: 180 -> 360(0).
    d = describeArc(cx, cy, r, 180, 360);
  } else if (mode === 'widget4') {
    // Open Circle (C-Shape)
    // Gap at bottom-right.
    // Start ~135deg (Bottom Left) -> End ~45deg (Bottom Right)
    // Angles in standard circle (0=3oclock, 90=6oclock):
    // Bottom Left is 135 deg? No. 90 is bottom, 180 is left. So 135 is Bottom-Left. Correct.
    // Bottom Right is 45 deg? Yes.
    // We want to draw FROM 135 -> ... -> 360 -> 45.
    // Wait, svg arc draws clockwise. 
    // 135 -> 405 (45 + 360).
    d = describeArc(cx, cy, r, 135, 405);
  }
  
  ['track-path', 'progress-path', 'progress-glow'].forEach(id => {
    const el = document.getElementById(id);
    el.setAttribute('d', d);
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len} ${len}`;
    el.style.strokeDashoffset = len; // Start empty
    // Force immediate recalc for track
    if(id === 'track-path') el.style.strokeDashoffset = 0;
  });
}

// Helper: Polar to Cartesian
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0; // -90 to rotate 0 to top
  // Wait, my describeArc logic assumed standard unit circle?
  // Let's stick to standard math: 0 = 3 o'clock.
  // angleInRadians = angleInDegrees * Math.PI / 180;
  
  // Re-adjusting for standard SVGs
  // 0 deg = 3 o'clock.
  // 90 deg = 6 o'clock.
  // 180 deg = 9 o'clock.
  // 270 deg = 12 o'clock.
  
  var rad = (angleInDegrees) * Math.PI / 180.0;
  
  return {
    x: centerX + (radius * Math.cos(rad)),
    y: centerY + (radius * Math.sin(rad))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    
    // Note: This draws Counter-Clockwise? 
    // SVG Path A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    // sweep-flag 0 = counter-clockwise, 1 = clockwise.
    // I used 0. Let's try matching standard clockwise progress.
    
    // To draw clockwise from startAngle to endAngle:
    // Move to Start. Arc to End.
    start = polarToCartesian(x, y, radius, startAngle);
    end = polarToCartesian(x, y, radius, endAngle);
    
    // Check sweep
    // If we want clockwise, sweepFlag should be 1.
    
    return [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");
}

// --- Chat Commands ---

function handleChatCommand(data) {
  // Check permissions: 'mod' tag or broadcaster check
  const isBroadcaster = (data.nick === data.channel);
  const isMod = data.tags.mod === '1';
  if (!isBroadcaster && !isMod) return;
  
  const text = data.text.trim();
  const parts = text.split(' ');
  const cmd = parts[0].toLowerCase();
  const arg = parseFloat(parts[1]);
  
  if (cmd === '!add' && !isNaN(arg)) {
    addProgress(arg);
  } else if (cmd === '!subtract' && !isNaN(arg)) {
    addProgress(-arg);
  } else if (cmd === '!setprogress' && !isNaN(arg)) {
    currentProgress = arg;
    saveState();
    updateUI(true);
  } else if (cmd === '!setgoal' && !isNaN(arg)) {
    goalTarget = arg;
    saveState();
    updateUI(true);
  } else if (cmd === '!resetgoal') {
    currentProgress = 0;
    saveState();
    updateUI(true);
  }
}

// --- Utils ---

function celebrate() {
  const canvas = document.getElementById('confetti-canvas');
  // Simple particle system would go here
  // For brevity, we'll just flash the progress bar
  const p = document.getElementById('progress-path');
  p.style.filter = "brightness(1.5)";
  setTimeout(() => p.style.filter = "", 500);
}

// Helper for debug buttons
window.simulateEvent = function(type, val) {
  if(type === 'add') addProgress(val);
  if(type === 'reset') { currentProgress=0; saveState(); updateUI(true); }
  if(type === 'complete') { currentProgress=goalTarget; saveState(); updateUI(true); }
};
