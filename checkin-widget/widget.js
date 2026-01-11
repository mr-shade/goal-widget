// Check-In Counter Widget (Premium)
// Logic for handling Premium UI, Styling, and State

// --- STATE ---
let count = 0;
let settings = {
  // Config
  startCount: 0,
  incrementBy: 1,

  // Triggers
  triggerKeyword: "!checkin",
  rewardName: "",

  // Reset
  resetMode: "manual",
  manualResetToggle: false,

  // Visuals
  title: "Check-Ins", // Internal
  mainImage: "https://via.placeholder.com/150",
  labelText: "Checked In",
  enableFloating: true,
  fontFamily: "Nunito",

  // Colors
  primaryColor: "#CFAAF5",
  badgeColor: "#FFFFFF",
  badgeTextColor: "#545454",
  labelBgColor: "#F3E5F5",
  labelTextColor: "#6A4C93"
};

// DOM Elements
const widgetWrapper = document.getElementById('widgetWrapper');
const counterEl = document.getElementById('counter');
const mainImgEl = document.getElementById('mainImg');
const labelTextEl = document.getElementById('labelText');
const labelPillEl = document.querySelector('.label-pill');
const mainCircleEl = document.querySelector('.main-circle');
const badgeEl = document.querySelector('.count-badge');

// --- LOGIC ---

function updateDisplay() {
  counterEl.innerText = count;

  // Animate Badge
  badgeEl.classList.remove('bump');
  void badgeEl.offsetWidth; // trigger reflow
  badgeEl.classList.add('bump');
}

function increment(val) {
  count += (val || 1);
  updateDisplay();
}

function resetCounter() {
  count = 0;
  // If user has a startCount set, reset should probably go to that or 0?
  // Usually reset means 0.
  // But if the user uses "Starting Count" field to manage the streak manually, 
  // then when the widget loads, it loads Start Count.
  // A "Reset" action generally implies clearing session progress.
  // Let's stick to 0 for strict reset.
  updateDisplay();
}

// --- INITIALIZATION ---

function loadSettings(fieldData) {
  settings = { ...settings, ...fieldData };

  console.log("Loading Settings:", settings);

  // 1. Text & Content
  labelTextEl.innerText = settings.labelText;
  mainImgEl.src = settings.mainImage || "https://via.placeholder.com/150";

  // 2. Fonts
  if (settings.fontFamily) {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${settings.fontFamily.replace(/ /g, '+')}:wght@400;700;900&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.documentElement.style.setProperty('--font-family', `'${settings.fontFamily}', sans-serif`);
  }

  // 3. Colors -> CSS Variables
  const r = document.documentElement.style;
  r.setProperty('--primary-color', settings.primaryColor);
  r.setProperty('--badge-bg', settings.badgeColor);
  r.setProperty('--badge-text', settings.badgeTextColor);
  r.setProperty('--label-bg', settings.labelBgColor);
  r.setProperty('--label-text', settings.labelTextColor);

  // 4. Animation
  if (settings.enableFloating) {
    widgetWrapper.classList.add('floating');
  } else {
    widgetWrapper.classList.remove('floating');
  }

  // 5. State Initialization
  // Initialize Count from "Starting Count" field (this allows manual streak persistence)
  // We only set this ONCE on load.
  // If the user *changes* the field in editor, it reloads -> updates count. Perfect.
  if (typeof settings.startCount === 'number') {
    count = settings.startCount;
  }
  updateDisplay();
}

// --- EVENTS ---

window.addEventListener('onWidgetLoad', function (obj) {
  loadSettings(obj.detail.fieldData);
});

window.addEventListener('onEventReceived', function (obj) {
  const event = obj.detail.event;
  if (!event) return;

  if (event.listener === 'message') {
    const data = event.data;
    if (data.nick === 'streamelements' || data.nick === 'nightbot') return;

    // Keyword Trigger
    if (settings.triggerKeyword && data.text && data.text.toLowerCase().includes(settings.triggerKeyword.toLowerCase())) {
      increment(settings.incrementBy);
    }
  }

  else if (event.listener === 'redemption-latest') {
    const reward = event.data.reward || {};
    if (settings.rewardName && reward.title && reward.title.toLowerCase() === settings.rewardName.toLowerCase()) {
      increment(settings.incrementBy);
    }
  }
});

// --- DEV MODE ---
window.devIncrement = (val) => increment(val);
window.devReset = () => resetCounter();
console.log("Premium Check-In Widget Loaded. Use devIncrement()");
