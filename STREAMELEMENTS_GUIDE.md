# StreamElements Custom Widget Development Guide

This guide documents the architecture and tactics used to build the **Unified Goal Widget**. It demonstrates how to create a robust, production-ready widget that runs seamlessly in both a **Local Development Environment** and the **StreamElements OBS/Browser Source** using a single codebase.

## 1. The "Hybrid" Architecture
The core philosophy is strict separation of **Logic (JS)**, **Presentation (CSS/SVG)**, and **Configuration (JSON)**, bridged by an **Environment Adapter**.

### The Problem
StreamElements widgets normally require being uploaded to the dashboard to test functionality. This feedback loop is very slow.

### The Solution (One File Strategy)
We detect the runtime environment. If the global `SE_API` object is missing, we assume we are running locally and **inject a Mock Layer** that simulates StreamElements behavior.

```javascript
/* widget.js Pattern */
(function() {
    // 1. Detect Environment
    if (typeof SE_API !== 'undefined') {
        // Production: Attach real listeners
        window.addEventListener('onWidgetLoad', (obj) => init(obj.detail.fieldData, obj.detail.session.data));
        window.addEventListener('onEventReceived', (obj) => onEvent(obj.detail));
    } else {
        // Local Dev: Inject Mocks
        window.isDev = true;
        mockStreamElementsEnvironment();
    }
})();
```

## 2. Connecting StreamElements APIs
We rely on three specific interaction points.

### A. Configuration (`fields.json`)
Defines the UI controls in the StreamElements dashboard (left sidebar).
*   **Tactic**: Group related fields using the `"group"` property (e.g., "Colors", "Behavior").
*   **Tactic**: Use distinct `type`s (`colorpicker`, `image-input`, `slider`, `dropdown`) to create a professional UX.
*   **Tactic**: Provide rational `value` defaults so the widget looks good immediately upon loading.

### B. Initialization (`onWidgetLoad`)
Called once when the widget starts or when settings change.
*   **Payload**: Contains user settings (`fieldData`) and session data (`data`).
*   **Tactic**: **Strict Defaulting**. StreamElements might return `undefined` for new fields. Always merge with a default object:
    ```javascript
    settings = { ...defaults, ...fieldData };
    ```
*   **Tactic**: **Type Safety**. Convert string inputs to numbers immediately using `parseFloat()` to prevent `NaN` errors later.

### C. Event Loop (`onEventReceived`)
Called whenever a Twitch/YouTube event (Follow, Sub, Tip) occurs.
*   **Tactic**: **Early Return**. Filter events immediately if they don't match the listener you care about.
*   **Tactic**: **Unified Handlers**. Route different event types (Tip, Cheer, Sub) to a single `updateProgress(amount)` function to keep logic clean.

## 3. The Local Development Mock
To make the widget work locally without changing code, we simulate the environment at the bottom of `widget.js`.

**Features of the Mock:**
1.  **Simulated Store**: A dummy `SE_API.store` object that implements `get` and `set` (returning Promises) so the main code doesn't crash.
2.  **Dev UI**: An HTML overlay (`<div id="dev-controls">`) that injects fake events when buttons are clicked.
3.  **Auto-Init**: We manually call the `init()` function with a preset configuration object after `100ms`, mimicking the boot sequence of the real widget.

## 4. Best Practices Used

### 🎨 SVG Geometry for Shapes
Instead of using static images or CSS border-radius hacks, we used **SVG Paths** with `stroke-dasharray`.
*   **Why**: Infinite scalability, zero pixelation, and performance.
*   **The Power Move (`describeArc`)**: A single mathematical function calculates the SVG path command (`d="M... A..."`) dynamically based on start and end angles.
    *   This allowed us to reuse the *exact same code* for "Full Circle", "Arch", "Horseshoe", and "Wide Arc" just by changing the angles passed to the function.

### 💾 Persistence (`SE_API.store`)
We use `SE_API.store.set('key', value)` to save the current goal progress.
*   **Why**: Browser sources in OBS refresh frequently. Without persistence, the goal resets to 0 every time the streamer restarts OBS.
*   **Key Isolation**: Use unique keys (e.g., `goal_unified_current`) to avoid conflicts if the user runs multiple widgets.

### ⚡ CSS Variables for Theming
We map `fields.json` settings directly to CSS variables (`--primary`, `--size`, `--font`).
*   **Benefit**: changing a color in the settings updates the DOM instantly via the `style` attribute on the root, without needing to query selectors or force expensive style recalculations on individual elements.

## 5. File Structure
This structure allows you to zip the contents and upload/copy-paste effortlessly.
```
/unified-widget
  ├── widget.html   (Structure + Hidden Dev UI)
  ├── widget.css    (Styles + CSS Vars + Dev UI Styles)
  ├── widget.js     (Logic + Mock Adapter)
  └── fields.json   (Schema configuration)
```
