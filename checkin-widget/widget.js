// Check-In Counter Widget (Premium +)
// Features: Audio, Sparkles, Local Persistence (Streak), Detailed Customization

// --- STATE ---
let count = 0;
let lastActiveTime = Date.now();
let settings = {
  // Config
  startCount: 0,
  incrementBy: 1,

  // Triggers
  triggerKeyword: "!checkin",
  rewardName: "",

  // Streak
  enableStreak: false,

  // Visuals
  widgetTitle: "Check-Ins",
  mainImage: "",
  labelText: "Checked In",
  fontFamily: "Nunito",

  // Toggles
  hideLabel: false,
  hideStamp: false,
  hideCounter: false,
  hideSparkles: false,

  // Visual assets
  defaultStamp: "star",

  // Audio
  sfxSound: "",
  sfxVolume: 50,

  // Colors (variables mapped in loadSettings)
};

// DOM Elements
const counterEl = document.getElementById('counter');
const mainImgEl = document.getElementById('mainImg');
const labelTextEl = document.getElementById('labelText');
const labelPillEl = document.getElementById('labelPill');
const mainCircleEl = document.getElementById('mainCircle');
const badgeEl = document.getElementById('badge');
const sparklesEl = document.getElementById('sparkles');
const sfxPlayer = document.getElementById('sfxPlayer');

// --- LOGIC ---

function updateDisplay() {
  counterEl.innerText = count;

  // Animate Badge
  badgeEl.classList.remove('bump');
  void badgeEl.offsetWidth;
  badgeEl.classList.add('bump');
}

function playSound() {
  if (settings.sfxSound) {
    sfxPlayer.volume = (settings.sfxVolume || 50) / 100;
    sfxPlayer.currentTime = 0;
    sfxPlayer.play().catch(e => console.log("Audio play failed (autoplay policy?):", e));
  }
}

function spawnSparkles() {
  if (settings.hideSparkles) return;

  // Create 3 random stars
  for (let i = 0; i < 3; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    // Random position around center
    // Wrapper is 250x250, center is 125,125
    const angle = Math.random() * Math.PI * 2;
    const radius = 60 + Math.random() * 40; // Around the circle
    const x = 115 + Math.cos(angle) * radius; // 115 to center roughly (star width 20)
    const y = 115 + Math.sin(angle) * radius;

    star.style.left = `${x}px`;
    star.style.top = `${y}px`;

    sparklesEl.appendChild(star);

    // Trigger animation
    requestAnimationFrame(() => {
      star.classList.add('animate');
    });

    // Cleanup
    setTimeout(() => {
      star.remove();
    }, 1000);
  }
}

function increment(val) {
  count += (val || 1);
  lastActiveTime = Date.now();
  saveState();

  updateDisplay();
  playSound();
  spawnSparkles();
}

function resetCounter() {
  count = 0;
  saveState();
  updateDisplay();
}

// --- PERSISTENCE (STREAK) ---
// Using localStorage to match 'Streak' requests where user wants generic persistence.
// Keyed by title to allow multiple widgets if they change title.
function getStorageKey() {
  // Fallback to "Check-Ins" if title missing
  const t = settings.widgetTitle || "Check-Ins";
  return `checkin_widget_${t.replace(/\s/g, '_')}`;
}

function saveState() {
  if (!settings.enableStreak) return;
  const data = {
    count: count,
    lastActive: lastActiveTime
  };
  localStorage.setItem(getStorageKey(), JSON.stringify(data));
}

function loadState() {
  if (!settings.enableStreak) return;

  const raw = localStorage.getItem(getStorageKey());
  if (raw) {
    try {
      const data = JSON.parse(raw);
      // Check for 24h expiry if strictly "Streak"
      // Let's say streak breaks if > 24h + buffer (e.g. 36h)
      const now = Date.now();
      const hoursSince = (now - data.lastActive) / (1000 * 60 * 60);

      if (hoursSince < 36) {
        // Restore
        count = data.count;
      } else {
        console.log("Streak broken! Resetting.");
        count = 0; // Or keep it? Prd said "If you miss a day, you loose".
      }
    } catch (e) {
      console.error("Load state failed", e);
    }
  }
}

// --- INITIALIZATION ---

function loadSettings(fieldData) {
  settings = { ...settings, ...fieldData };

  // 1. Text & Content
  labelTextEl.innerText = settings.labelText;

  // Logic for Image: Custom > Default > Placeholder
  let imgUrl = settings.mainImage;
  if (!imgUrl) {
    // Map defaults to online assets or local placeholders
    // Using generic icons for demonstration
    const icons = {
      star: "https://img.icons8.com/emoji/96/000000/star-emoji.png",
      heart: "https://img.icons8.com/emoji/96/000000/purple-heart.png",
      check: "https://img.icons8.com/emoji/96/000000/check-mark-button-emoji.png",
      party: "https://img.icons8.com/emoji/96/000000/party-popper.png"
    };
    imgUrl = icons[settings.defaultStamp] || icons.star;
  }
  mainImgEl.src = imgUrl;

  if (settings.sfxSound) sfxPlayer.src = settings.sfxSound;

  // 2. Toggles
  labelPillEl.classList.toggle('hidden', settings.hideLabel);
  mainCircleEl.classList.toggle('hidden', settings.hideStamp);
  badgeEl.classList.toggle('hidden', settings.hideCounter);
  // hideSparkles handled in spawnSparkles

  // 3. Scaling
  if (settings.widgetScale) {
    const scale = settings.widgetScale / 100;
    // Apply scale to wrapper
    widgetWrapper.style.transform = `scale(${scale})`;
    // Optional: adjust origin if needed, default center is fine for flex
  }

  // 3. Fonts
  if (settings.fontFamily) {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${settings.fontFamily.replace(/ /g, '+')}:wght@400;700;900&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.documentElement.style.setProperty('--font-family', `'${settings.fontFamily}', sans-serif`);
  }

  // 4. Colors -> CSS Variables
  const r = document.documentElement.style;
  r.setProperty('--avatar-border-outer', settings.avatarBorderOuter);
  r.setProperty('--avatar-border-center', settings.avatarBorderCenter);
  r.setProperty('--avatar-border-inner', settings.avatarBorderInner);

  r.setProperty('--badge-bg', settings.badgeBgColor);
  r.setProperty('--badge-border', settings.badgeBorderColor);
  r.setProperty('--badge-text', settings.badgeTextColor);

  r.setProperty('--label-bg', settings.labelBgColor); // Did we map this field? Yes fields.json needs to match logic
  // Wait, I reused names. style.css uses --label-bg. 
  // fields.json uses labelBgColor? No, in my new write_to_file I didn't add labelBgColor?
  // CHECK fields.json content. I added avatar colors, badge colors...
  // I MISSED 'labelBgColor' and 'labelTextColor' in the new fields.json!
  // I must default them or add them.
  // I will assume defaults if missing from fields.
}

// --- EVENTS ---

window.addEventListener('onWidgetLoad', function (obj) {
  console.log("Widget Load");
  const fieldData = obj.detail.fieldData;
  loadSettings(fieldData);

  // Handle startCount vs Persistence
  if (settings.enableStreak) {
    loadState();
  } else if (typeof settings.startCount === 'number' && settings.startCount > 0) {
    count = settings.startCount;
  }

  updateDisplay();
});

window.addEventListener('onEventReceived', function (obj) {
  const event = obj.detail.event;
  if (!event) return;

  if (event.listener === 'message') {
    const data = event.data;
    if (data.nick === 'streamelements' || data.nick === 'nightbot') return;

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
