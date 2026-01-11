# Check-In Counter Widget

A strictly defined, production-ready StreamElements Custom Widget for tracking viewer check-ins via Chat Commands or Channel Rewards.

**Version**: 1.0.0
**Author**: [Your Name/Antigravity]

## Overview
This widget displays a real-time counter on your stream overlay. It increments when:
1. A viewer types a specific keyword (e.g., `!checkin`).
2. A viewer redeems a specific Channel Reward.

It is designed to be **stateless**, meaning it resets when the browser source is reloaded, making it perfect for per-stream or per-session tracking.

## Files
- `index.html`: The structure of the widget.
- `style.css`: Visual styling, fully customizable via StreamElements fields.
- `widget.js`: logic for event handling and counting.
- `fields.json`: Configuration schema for the StreamElements editor.
- `README.md`: This file.

## Installation

### 1. StreamElements Setup
1. Go to your **StreamElements Dashboard** -> **My Overlays**.
2. Create a **New Overlay** (set resolution to 1080p).
3. Click `Add Widget` -> `Static/Custom` -> `Custom Widget`.
4. Click `Open Editor` on the left panel.
5. You will see tabs for HTML, CSS, JS, Fields, and Data.
6. **Copy & Paste** the content of the files provided in this package into the corresponding tabs:
   - `index.html` -> **HTML** tab
   - `style.css` -> **CSS** tab
   - `widget.js` -> **JS** tab
   - `fields.json` -> **FIELDS** tab
7. Click **Done**.

### 2. Configuration
In the StreamElements Overlay Editor, select the widget to see the settings on the left:
- **Title Text**: Heading above the counter.
- **Font Family**: Google Font name (e.g., "Inter", "Roboto", "Press Start 2P").
- **Increment By**: How much to add per action.
- **Trigger Keyword**: Chat message to listen for.
- **Channel Reward Name**: Exact name of the Twitch Channel Reward to listen for.
- **Colors**: Pick text and accent colors.
- **Animation**: Toggle bounce effect.

### 3. OBS Setup
1. In StreamElements, click **Save**.
2. Click the **Copy Overlay URL** icon (chain link).
3. Open OBS Studio.
4. Add Source -> **Browser**.
5. Paste the URL.
6. Set Width/Height (e.g., 500x500 or custom).
7. Check "Shutdown source when not visible" if you want it to reset when you hide it.

## Local Development Mode
You can test this widget locally without StreamElements.

1. Open `index.html` in a web browser (Chrome recommended).
2. Open the **Developer Console** (F12 or Right Click -> Inspect -> Console).
3. Use the following commands to test:
   - `devIncrement(1)`: Manually adds to counter.
   - `devReset()`: Resets counter to 0.
   - `devMockEvent("!checkin")`: Simulates a chat message.
   - `devMockEvent(null, true)`: Simulates a channel reward redemption.

## Limitations
- **Stateless**: The counter resets if you refresh the overlay or restart OBS. This is by design for session-based tracking.
- **Bot Filter**: Ignores 'streamelements' and 'nightbot'.

## Future Roadmap
- [ ] Persistence (save count across reloads via SE API).
- [ ] Leaderboard support.
- [ ] Unique user only mode.
