# Check-In Counter Widget (Premium Edition)

A high-quality, "Kawaii" aesthetic stream widget for tracking viewer check-ins. Supports custom avatars, badge styles, and animations matching premium widget marketplace standards.

**Version**: 2.0.0 (Premium UI)
**Author**: [Your Name/Antigravity]

## Features
- **Premium UI**: Rounded avatars, cloud-shaped badges, and pill labels.
- **Visual Customization**:
  - Upload your own Avatar/Stamp image.
  - Customize all colors (Borders, Badge, Label text/bg).
  - Floating animations.
- **Triggers**: Works with Chat Keywords and Channel Rewards.
- **Streak Support**: Use the "Starting Count" field to manually maintain streaks across sessions.

## Files
- `index.html`: Widget structure.
- `style.css`: Premium styling (Pastel/Kawaii).
- `widget.js`: Logic.
- `fields.json`: Configuration schema for StreamElements.

## Installation inside StreamElements
1. Create a **Custom Widget** in StreamElements.
2. Paste the contents of `index.html`, `style.css`, `widget.js`, and `fields.json` into their respective tabs in the Editor.
3. **Configure**:
   - **Main Image**: Upload your character art or stamp.
   - **Colors**: Match your stream theme.
   - **Trigger**: Set your `!checkin` command or Reward name.
   - **Start Count**: If you want to start from a specific number (e.g., yesterdays count).

## Developer / Local Mode
Open `index.html` in your browser.
- Open Console (F12).
- run `devIncrement(1)` to see the badge pop animation.
- resize window to see responsive centering.

## Design Notes
- Uses `Nunito` font for a rounded, friendly look.
- "Floating" animation can be toggled to reduce motion.
- "Cloud" badge effect is achieved via CSS borders and radius.
