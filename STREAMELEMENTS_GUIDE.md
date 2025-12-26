# StreamElements Custom Widget Development Masterclass

This comprehensive guide documents the architecture, tactics, and best practices used to build the **Unified Goal Widget**. It serves as a blueprint for creating robust, production-ready widgets that work seamlessly in both **Local Development Environments** and **StreamElements OBS/Browser Sources**.

---

## 🏗️ 1. Architecture: The "Hybrid" Bridge Pattern

The core challenge in StreamElements development is the feedback loop. Uploading code to the dashboard to test every small change is inefficient. We solve this using a **Hybrid Architecture** that abstracts the environment.

### The Problem
*   **Production**: Runs in an OBS Browser Source. Receives data via `window.onEventReceived`. Has a global `SE_API` object.
*   **Development**: Runs in `localhost`. Has no event stream. Has no `SE_API`.

### The Solution
We detect the runtime environment and inject a **Mock Adaptor** if we are running locally. This allows the exact same business logic to run in both places without modification.

#### Code Pattern
```javascript
(function() {
    // 1. Detection strategy
    const isProduction = typeof SE_API !== 'undefined';

    if (isProduction) {
        // PRODUCTION: Attach to real StreamElements event bus
        window.addEventListener('onWidgetLoad', (obj) => init(obj.detail.fieldData, obj.detail.session.data));
        window.addEventListener('onEventReceived', (obj) => onEvent(obj.detail));
    } else {
        // DEVELOPMENT: Boot the Simulator
        console.log("🛠️ Starting Local Dev Environment");
        window.isDev = true;
        
        // 1. Mock the API
        window.SE_API = { 
            store: { 
                get: (key) => Promise.resolve(localStorage.getItem(key)), // Use LocalStorage for persist testing
                set: (key, val) => localStorage.setItem(key, val) 
            } 
        };
        
        // 2. Inject Dev UI
        injectDevControls(); // Spawns the buttons on screen
        
        // 3. Auto-Boot
        setTimeout(() => {
            // Check fields.json for your default values and replicate them here
            init({
                goalValue: 100,
                primaryColor: '#ff0000',
                // ... all other defaults
            }, {});
        }, 100);
    }
})();
```

---

## 🎛️ 2. Mastering `fields.json`

The `fields.json` file is the contract between your code and the user. It generates the configuration UI in the StreamElements dashboard.

### Field Types Reference

| Type | Description | JSON Example |
| :--- | :--- | :--- |
| **header** | Visual separator | `{"type": "header", "label": "Colors"}` |
| **text** | String input | `{"type": "text", "label": "Title", "value": "GOAL"}` |
| **number** | Numeric input | `{"type": "number", "step": 1, "min": 0, "max": 100}` |
| **checkbox** | Boolean toggle | `{"type": "checkbox", "label": "Enable Sound"}` |
| **colorpicker** | Hex color selector | `{"type": "colorpicker", "value": "#ff0000"}` |
| **dropdown** | Select list | `{"type": "dropdown", "options": {"key": "Label"}}` |
| **slider** | Range slider | `{"type": "slider", "min": 0, "max": 100, "step": 1}` |
| **image-input** | File uploader | `{"type": "image-input", "label": "Custom Icon"}` |
| **googleFont** | Font selector | `{"type": "googleFont", "label": "Font Family"}` |

### Best Practices
1.  **Grouping**: Use the `"group"` property on *every* field to organize them into tabs (e.g., `Settings`, `Style`, `Data`).
2.  **Validation**: Always assume the user might enter bad data (e.g., text in a number field). Sanitize in JS:
    ```javascript
    // Robust parsing
    const target = parseFloat(settings.goalValue) || 100; // Fallback prevents crash
    ```

---

## 📐 3. The SVG Engine: `describeArc`

Direct CSS manipulation is limited for complex shapes. We use SVG paths because they are vector-based (crisp at any resolution) and mathematically manipulatable.

### The Algorithm
To draw any circular segment (Circle, Arch, Horseshoe), we use a helper that converts **Polar Coordinates** (Angles) to **Cartesian Coordinates** (X, Y).

```javascript
function describeArc(x, y, radius, startAngle, endAngle) {
    // 1. Convert angles to X,Y points on the circle
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    
    // 2. Determine if arc is > 180 degrees (requires largeArcFlag=1)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    // 3. Build SVG Path Command
    // M = Move to start
    // A = Arc to end (Radius X, Radius Y, Rotation, LargeArc, Sweep, EndX, EndY)
    return [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y // "1" = Clockwise
    ].join(" ");
}
```

### Shape Recipes
By simply changing the angles passed to this function, we create different widgets:
*   **Full Circle**: 0° to 359.9°
*   **Upright Arch**: 270° (Left) to 90° (Right) (+360 for calculation = 450°)
*   **Horseshoe**: 210° to 510° (300° total span)

---

## 💾 4. State & Persistence

Browser sources in OBS are ephemeral. If the user closes OBS or hides the scene, the memory is cleared. You **must** persist data.

### The `SE_API.store`
StreamElements provides a cloud key-value store.
*   **Get**: `SE_API.store.get('my_key_name').then(val => { ... })`
*   **Set**: `SE_API.store.set('my_key_name', value)`

### Strategy
1.  **On Load**: Fetch the value. If `null`, use the `startingValue` from `fields.json`.
2.  **On Update**: Immediately `.set()` the new value.
3.  **Key Namescoping**: Use unique keys (e.g., `goal_unified_v1`) to prevent collisions with other widgets I might have.

---

## ⚡ 5. CSS Architecture

We use **CSS Custom Properties (Variables)** to make the styling entirely data-driven.

### The Variables
```css
:root {
  --primary: #ff0000;
  --size: 400px;
  --font: 'Poppins';
}
```

### The JS Bridge
In `widget.js`, `applyStyles()` maps the JSON settings to these variables:
```javascript
const r = document.documentElement;
r.style.setProperty('--primary', settings.primaryColor);
r.style.setProperty('--size', settings.widgetSize + 'px');
```

This allows for instant, repaint-free updates. Changing the size in the JS simply updates one number, and the entire widget (CSS layout, SVG dimensions) scales relative to that variable.

---

## 🚨 6. Troubleshooting Guide

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **"NaN" displayed** | `fields.json` value was empty or invalid. | Use `parseFloat() || default` in JS. |
| **Path Invisible** | `stroke-dashoffset` set to full length. | Initialize background tracks with `offset: 0`. |
| **Image Blocks Text** | Z-Index stacking order. | Set Image `z-index: 1`, Text `z-index: 2` in CSS. |
| **Font not changing** | Google Font not loaded. | JS must create `<link>` tag dynamically for `settings.fontFamily`. |
| **Layout Overlap** | Absolute positioning without specific bounds. | Use specific class overrides (e.g., `.mode-semi`) to adjust top/bottom spacing. |

---

## 🚀 7. Deployment Checklist

Before handing off code:
1.  [ ] **Reset Defaults**: Ensure `widget.js` defaults match `fields.json` defaults.
2.  [ ] **Remove Console Logs**: Keep the prod output clean (except for errors).
3.  [ ] **Verify Mock Removal**: Ensure the dev controls are hidden by default via CSS (`.hidden { display: none }`).
4.  [ ] **Test Zero States**: What happens if the goal is 0? Or 100/100?
5.  [ ] **Upload**: Copy content of all 4 files (`.html`, `.css`, `.js`, `.json`) into the StreamElements Editor fields.
