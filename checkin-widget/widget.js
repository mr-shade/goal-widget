/**
 * Check-In Counter Widget
 * Built for StreamElements & OBS
 *
 * Architecture:
 * - Stateless runtime (resets on load unless session persistence logic is added, but PRD says stateless/configurable)
 * - Single Source of Truth: fields.json
 */

// --- STATE ---
let count = 0;
let settings = {
  title: "Check-Ins",
  fontFamily: "Inter",
  incrementBy: 1,
  triggerKeyword: "!checkin",
  rewardName: "",
  textColor: "#ffffff",
  accentColor: "#00ffcc",
  enableAnimation: true,
  resetMode: "manual",
  manualResetToggle: false
};

// Internal state to track toggle changes
let lastResetToggleState = false;

// DOM Elements
const widgetEl = document.getElementById('widget');
const titleEl = document.getElementById('title');
const counterEl = document.getElementById('counter');

// --- CORE LOGIC ---

/**
 * Updates the visual counter and triggers animation
 */
function updateDisplay() {
  counterEl.innerText = count;
  
  if (settings.enableAnimation) {
    counterEl.classList.remove('bump');
    // Trigger reflow
    void counterEl.offsetWidth;
    counterEl.classList.add('bump');
  }
}

/**
 * Increments the counter by a specific value
 * @param {number} value 
 */
function increment(value = 1) {
  count += value;
  updateDisplay();
}

/**
 * Resets the counter to 0
 */
function resetCounter() {
  count = 0;
  updateDisplay();
}

/**
 * Loads Google Font dynamically
 * @param {string} fontName 
 */
function loadFont(fontName) {
  if (!fontName) return;
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;600;800&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  document.documentElement.style.setProperty('--font-family', `'${fontName}', sans-serif`);
}

/**
 * Validates if the message should trigger a count
 * @param {object} data - Event data
 * @returns {boolean}
 */
function shouldTriggerMessage(data) {
    // Basic bot protection: ignore common bot names if needed, 
    // but usually user just wants keyword match.
    // We can filter empty messages or non-matches.
    const message = (data.text || "").toLowerCase();
    const keyword = (settings.triggerKeyword || "").toLowerCase();
    
    if (!message || !keyword) return false;
    
    // Check for exact match or contains, PRD says "matches", usually contains is better for chat commands
    // But for a command like !checkin, usually it's startsWith or exact match.
    // Let's go with "includes" for flexibility as per typical SE widgets, unless strict command.
    return message.includes(keyword);
}

// --- STREAM ELEMENTS EVENTS ---

window.addEventListener('onWidgetLoad', function (obj) {
  const fieldData = obj.detail.fieldData;
  settings = { ...settings, ...fieldData };

  // Apply visual settings
  titleEl.innerText = settings.title;
  document.documentElement.style.setProperty('--text-color', settings.textColor);
  document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  
  loadFont(settings.fontFamily);

  // Handle Session Reset logic
  // Since this is a stateless widget (reloads on OBS scene switch usually), 
  // "Session" implies it starts at 0. If we wanted persistence, we'd use SE API state.
  // PRD Hard Constraint: "Stateless runtime (memory resets on reload)" -> So 0 is correct.
  // "Session-based reset" in PRD just means it resets when you close/open usually.
  
  // Initialize toggle state for manual reset
  lastResetToggleState = settings.manualResetToggle;
  
  console.log("[Check-In Widget] Loaded", settings);
});

window.addEventListener('onEventReceived', function (obj) {
  const event = obj.detail.event;
  if (!event) return;

  // listener: widget-button (Manual Reset via Field update check)
  // StreamElements usually pushes a new onWidgetLoad or similar when fields update?
  // Actually, standard SE behavior for dashboard changes is often a reload or specific event.
  // But if the user toggles a checkbox in dashboard, it might come through onWidgetLoad if the widget reloads.
  // If "onEventReceived" captures field updates, we handle it. 
  // IMPORTANT: SE widgets often reload completely on field save. 
  // So 'manualResetToggle' changing might just spawn a new widget instance with the new value.
  // If so, we can't detect the *change* easily unless we persist something.
  // BUT, if the user hits "SAVE" in SE editor, the widget iframe reloads.
  // So a "Manual Reset" button in fields.json that toggles logic is tricky if state is lost.
  // Strategy: If resetMode is manual, we assume the user wants to click a button.
  // The PRD asks for "Manual reset (button)". 
  // In SE Custom Widgets, usually you add a "API button" field or usage of chat command/dashboard button.
  // Since we are limited to fields.json/html/js, and no backend:
  // We can use the Reset Button Toggle approach: 
  // If the user toggles "Manual Reset" and saves, the widget reloads. 
  // We can't distinguish "reload due to reset" vs "reload due to obs open".
  // PROPER WAY: Listen for specific widget events or just use a helper command like !resetcheckins (if we could parse streamer messages).
  // Let's support a streamer-only command `!resetcheckins` as a hidden feature or just trust the standard reload=reset behavior for this stateless widget.
  // Wait, PRD says: "Support: Increment by configurable value, Manual reset (button), Session-based reset".
  // And "Stateless runtime".
  // If it's stateless, *every* reload is a reset.
  // So "Manual Reset" button in the dashboard (fields.json) is effectively just "Reload Widget".
  // We will assume "Manual Reset" means we provide a visual button in the widget? 
  // No, "Button in dashboard" (PRD 5.1).
  // fields.json doesn't support a "clickable button" that sends an event without reloading or saving.
  // However, we added a checkbox "manualResetToggle". If user toggles it and saves, widget reloads => Count 0.
  // That mimics a reset!
  
  if (event.listener === 'message') {
    const data = event.data;
    // Filter bots if needed (SE often sends 'isCustomReward', 'tags' etc)
    // Minimal bot check: Check if nick is commonly known bot or user defined 'ignore' list (not in fields yet).
    // PRD: "Must ignore: Bots".
    // We'll trust the user isn't a bot, or add a simple check if nick is 'streamelements' etc.
    if (data.nick === 'streamelements' || data.nick === 'nightbot') return;

    if (shouldTriggerMessage(data)) {
      increment(settings.incrementBy);
    }
    
    // Hidden streamer reset command
    if ((data.text || "").toLowerCase() === "!resetcounter" && (data.badges || []).some(b => b.type === 'broadcaster')) {
        resetCounter();
    }
  }

  else if (event.listener === 'redemption-latest') {
    // Channel Point Reward
    // data.reward.title, data.redemption.user
    const reward = event.data.reward || {};
    // const user = event.data.redemption ? event.data.redemption.user : {}; // For unique user logic later
    
    if (settings.rewardName && reward.title && reward.title.toLowerCase() === settings.rewardName.toLowerCase()) {
      increment(settings.incrementBy);
    }
  }
});

// --- DEV MODE ---
// Exposed for local testing via Console

window.devIncrement = function(val) {
  increment(val || 1);
  console.log("Dev: Incremented", count);
};

window.devReset = function() {
  resetCounter();
  console.log("Dev: Reset");
};

window.devMockEvent = function(message = "!checkin", isReward = false) {
  if (isReward) {
      const event = {
          detail: {
              event: {
                  listener: 'redemption-latest',
                  data: {
                      reward: { title: settings.rewardName || "Check-In Reward" },
                      redemption: { user: { display_name: "TestUser" } }
                  }
              }
          }
      };
      window.dispatchEvent(new CustomEvent('onEventReceived', event));
  } else {
      const event = {
          detail: {
              event: {
                  listener: 'message',
                  data: {
                      nick: "TestUser",
                      text: message,
                      badges: []
                  }
              }
          }
      };
      window.dispatchEvent(new CustomEvent('onEventReceived', event));
  }
};

console.log("[Check-In Widget] Initialized. Dev commands: devIncrement(), devReset(), devMockEvent('msg')");
