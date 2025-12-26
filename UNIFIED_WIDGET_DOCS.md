# Unified Goal Widget Documentation

## 1. Project Overview
The **Unified Goal Widget** is a high-performance StreamElements custom widget designed to support **4 distinct geometric shapes** and **2 visual styles** within a single, lightweight codebase. It eliminates the need for maintaining separate widgets for different designs by using dynamic SVG generation.

### Key Features
*   **4 Shapes**: Full Circle (360°), Upright Arch (180°), Broad Arc (270°), Horseshoe (300°).
*   **2 Modes**: Solid Colors or Neon Glow + Gradients.
*   **Hybrid Runtime**: Runs natively in StreamElements *and* includes a full local development environment with mock APIs.
*   **Persistence**: Automatically saves goal progress to StreamElements servers (`SE_API.store`).
*   **Dynamic Assets**: Supports custom image uploads with scaling and positioning logic.

---

## 2. File Architecture

### `widget.html`
*   **Container**: Holds the `#widget-container` which centers all elements.
*   **SVG Layer**: Contains three `<path>` elements:
    *   `#track-path`: The gray background track.
    *   `#glow-path`: The blurred neon underlay (visible only in neon mode).
    *   `#progress-path`: The main gradient/colored progress bar.
*   **Content Layer**: Overlays text (`#title-el`, `#value-el`) and the custom image (`#custom-image`) on top of the SVG.
*   **Dev UI**: A hidden `<div id="dev-controls">` that only appears when running locally.

### `widget.css`
*   **CSS Variables**: All dynamic properties (colors, size, fonts) are mapped to `:root` variables (e.g., `--primary`, `--size`).
*   **Layout Logic**:
    *   Uses absolute positioning to layer the SVG and Content.
    *   Class-based overrides (e.g., `.mode-semi` adds specific spacing to accommodate the arch shape).
*   **Z-Indexing**: Critical styling ensures the Custom Image (`z-index: 1`) sits behind the Text (`z-index: 2`) but above the SVG.

### `widget.js`
The brain of the widget. It handles:
1.  **Initialization**: Merges user settings from `onWidgetLoad` with robust defaults (preventing `NaN` errors).
2.  **Geometry Engine (`describeArc`)**: A mathematical helper that generates SVG path commands (`d="M... A..."`) based on start/end angles.
3.  **Event Handling**: Listens for `onEventReceived` and routes Tips/Subs/Cheers to the `updateProgress` function.
4.  **Font Loading**: Dynamically injects Google Fonts `<link>` tags based on the user's selection.

### `fields.json`
Defines the StreamElements configuration UI.
*   **Organization**: Fields are grouped into clear sections: `🎨 Appearance`, `🌈 Colors`, `📝 Content`, `🖼️ Image`, `📊 Goal Data`.
*   **Input Types**: Uses specialized inputs like `colorpicker`, `image-input`, and `googleFont` for a premium user experience.

---

## 3. Core Mechanics

### The Geometry System
Instead of pre-made assets, every shape is calculated mathmatically. This allows smooth animation between any progress point.

```javascript
/* Example: Creating the 'Upright Arch' */
// Start at 270° (Left) -> Go clockwise to 450° (Right)
d = describeArc(250, 250, 200, 270, 450);
```

### State Management
*   **Current Progress**: Stored in `SE_API.store` under the key `goal_unified_current`.
*   **Updates**: When an event occurs (e.g., Sub +1), the widget:
    1.  Calculates new total.
    2.  Updates the visual bar (`stroke-dashoffset`).
    3.  Persists the new value to the server immediately.

---

## 4. Configuration Reference

| Setting | Description | Key |
| :--- | :--- | :--- |
| **Shape Mode** | Full, Semi, Arc75, OpenBottom | `shapeMode` |
| **Style Mode** | Toggles Neon Glow effect | `styleMode` |
| **Colors** | Gradient Start/End, Track, Text | `primaryColor`, `secondaryColor`... |
| **Center Image** | Upload URL, Scale %, Offset Y | `imageUrl`, `imageSize`, `imageOffsetY` |
| **Goal Data** | Target amount, Starting amount | `goalValue`, `startingValue` |
| **Events** | Trigger type (Follow/Sub/Tip) | `eventType` |

---

## 5. Development & Deployment

### Local Development
1.  Open `widget.html` in Chrome/Brave.
2.  The script detects missing `SE_API` and launches **Dev Mode**.
3.  Use the top-right control panel to test colors, shapes, and event simulation (`+5`, `Reset`).

### Deployment to StreamElements
1.  Go to StreamElements Dashboard > Streaming Tools > My Overlays.
2.  Create New Overlay > Add Custom Widget.
3.  Open Editor:
    *   **HTML**: Copy content of `widget.html`
    *   **CSS**: Copy content of `widget.css`
    *   **JS**: Copy content of `widget.js`
    *   **Fields**: Copy content of `fields.json`
4.  Click **Done**. The configuration sidebar will appear with all your options.
