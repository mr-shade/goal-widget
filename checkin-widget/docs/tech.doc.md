Below is a **single, consolidated Technical Design Document + Implementation Guide + README draft** suitable to hand off to an external builder (e.g., *Google Antigravity*).
It is written to be **explicit, implementation-focused, and environment-aware (local + StreamElements)**.

---

# Technical Design Document

## Check-In Counter Stream Widget

Version: 1.0 (MVP → Extensible)

---

## 1. System Overview

This widget is a **self-contained HTML/CSS/JS browser overlay** designed to run inside:

* StreamElements **Custom Widget**
* OBS **Browser Source**
* Local development environment (for testing)

The widget:

* Listens to **events (chat commands, keywords, rewards)** via StreamElements
* Updates a **counter state**
* Renders a **real-time animated UI**
* Is fully configurable via a single `fields.json` file

No backend is required for MVP.

---

## 2. Architecture

```
┌─────────────────────────┐
│ StreamElements Runtime  │
│ (or Local Dev Env)      │
└─────────────┬───────────┘
              │
              ▼
┌─────────────────────────┐
│ index.html              │
│  ├─ style.css           │
│  ├─ widget.js           │
│  └─ fields.json         │
└─────────────┬───────────┘
              │
              ▼
┌─────────────────────────┐
│ StreamElements API      │
│ - Chat events           │
│ - Channel rewards       │
│ - Widget fields         │
└─────────────────────────┘
```

---

## 3. File Structure

```
/widget
 ├── index.html
 ├── style.css
 ├── widget.js
 ├── fields.json
 ├── README.md
```

---

## 4. Widget UI Design

### Visual Elements

* Container
* Title label
* Counter number
* Optional icon/stamp
* Optional animation layer

### Layout

* Responsive
* Transparent background by default
* Scales cleanly in OBS

---

## 5. index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Check-In Counter Widget</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="widget">
    <div id="title">Check-Ins</div>
    <div id="counter">0</div>
  </div>

  <script src="widget.js"></script>
</body>
</html>
```

---

## 6. style.css

All visuals are controlled via **CSS variables** so they can be dynamically changed.

```css
:root {
  --font-family: 'Inter', sans-serif;
  --title-size: 24px;
  --counter-size: 64px;
  --text-color: #ffffff;
  --accent-color: #00ffcc;
  --bg-color: transparent;
}

body {
  margin: 0;
  background: var(--bg-color);
}

#widget {
  font-family: var(--font-family);
  text-align: center;
}

#title {
  font-size: var(--title-size);
  color: var(--text-color);
}

#counter {
  font-size: var(--counter-size);
  color: var(--accent-color);
  transition: transform 0.2s ease;
}

.bump {
  transform: scale(1.2);
}
```

---

## 7. widget.js (Core Logic)

### Responsibilities

* Load StreamElements fields
* Listen for events
* Update counter
* Apply animations

```js
let count = 0;
let settings = {};

const counterEl = document.getElementById('counter');

function bump() {
  counterEl.classList.add('bump');
  setTimeout(() => counterEl.classList.remove('bump'), 200);
}

function increment(value = 1) {
  count += value;
  counterEl.innerText = count;
  bump();
}

// StreamElements Event Listener
window.addEventListener('onEventReceived', function (obj) {
  const event = obj.detail.event;

  if (event.listener === 'message') {
    const message = event.data.text.toLowerCase();
    if (message.includes(settings.triggerKeyword)) {
      increment(settings.incrementBy);
    }
  }

  if (event.listener === 'redemption-latest') {
    if (event.data.reward.title === settings.rewardName) {
      increment(settings.incrementBy);
    }
  }
});

// Load widget fields
window.addEventListener('onWidgetLoad', function (obj) {
  settings = obj.detail.fieldData;

  document.documentElement.style.setProperty('--text-color', settings.textColor);
  document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  document.getElementById('title').innerText = settings.title;
});
```

---

## 8. fields.json (FULLY MODIFIABLE CONFIG)

This is the **single source of truth** for customization.

```json
{
  "title": "Check-In Counter Widget",
  "fields": [
    {
      "type": "text",
      "key": "title",
      "label": "Title Text",
      "default": "Check-Ins"
    },
    {
      "type": "number",
      "key": "incrementBy",
      "label": "Increment By",
      "default": 1
    },
    {
      "type": "text",
      "key": "triggerKeyword",
      "label": "Trigger Keyword",
      "default": "!checkin"
    },
    {
      "type": "text",
      "key": "rewardName",
      "label": "Channel Reward Name",
      "default": ""
    },
    {
      "type": "colorpicker",
      "key": "textColor",
      "label": "Text Color",
      "default": "#ffffff"
    },
    {
      "type": "colorpicker",
      "key": "accentColor",
      "label": "Counter Color",
      "default": "#00ffcc"
    }
  ]
}
```

---

## 9. Development Environment Setup

### Local Dev (Without StreamElements)

1. Serve files locally:

```bash
npx serve .
```

2. Mock StreamElements events:

```js
window.dispatchEvent(new CustomEvent('onWidgetLoad', {
  detail: { fieldData: { title: 'Test', incrementBy: 1 } }
}));
```

3. Trigger increment manually:

```js
increment();
```

---

## 10. StreamElements Environment Setup

### Steps

1. Open **StreamElements → Overlays**
2. Add **Custom Widget**
3. Paste:

   * HTML → `index.html`
   * CSS → `style.css`
   * JS → `widget.js`
   * Fields → `fields.json`
4. Save
5. Copy overlay URL
6. Add to OBS as **Browser Source**

---

## 11. Features to Implement (Checklist)

### MVP (Required)

* Chat keyword trigger
* Channel reward trigger
* Counter increment
* Animation
* Color & text customization
* Manual reset button

### V1 Enhancements

* Cooldowns per user
* Unique user tracking
* Auto-reset (daily/session)
* Sound trigger (external URL)
* Multiple counters
* Streak mode

### Future

* Leaderboard overlay
* Export stats
* Web dashboard
* White-label themes

---

## 12. Error Handling

* Ignore bot messages
* Throttle spam events
* Graceful fail if reward not found
* Reinitialize on widget reload

---

## 13. Security & Compliance

* No external API keys
* No user data persistence
* No PII storage
* StreamElements sandbox compliant

---

# README.md (For Google Antigravity)

```md
# Check-In Counter Stream Widget

A customizable StreamElements widget for Twitch/YouTube that tracks viewer check-ins via chat commands or channel rewards.

## Tech Stack
- HTML
- CSS
- Vanilla JavaScript
- StreamElements Custom Widget API

## Files
- index.html – UI markup
- style.css – Visual styling
- widget.js – Logic and event handling
- fields.json – Customizable settings

## Setup
1. Create a Custom Widget in StreamElements
2. Paste each file into the respective editor
3. Configure fields
4. Add overlay to OBS

## Features
- Real-time counter
- Chat & reward triggers
- Animated updates
- Fully customizable UI

## Constraints
- No backend
- Must work in OBS browser
- Must remain self-contained

## Extension Ready
The codebase is designed to support future features like leaderboards, analytics, and multi-counter support.
```

---

If you want next:

* **Exact StreamElements API event matrix**
* **Cooldown + unique user algorithm**
* **Multi-counter architecture**
* **Production-ready animation system**
* **Monetization-ready licensing logic**

Say which one to expand.
