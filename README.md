# Custom StreamElements Goal Widget

A highly customizable, animated Goal Widget for StreamElements with 4 distinct visual styles (Full Circle, Arch, Open Loop) and Neon/Solid appearance modes.

## Features
- **4 Layout Styles**: Full Circle (Text or Image focus), Semi-Circle Arch, Open Loop C-Shape.
- **Neon & Gradient Support**: Fully configurable colors with optional glow effects.
- **Goal Logic**: Handles Subs, Follows, Tips, Cheers, or Custom events.
- **Chat Commands**: Mods can `!add`, `!subtract`, `!setgoal`, `!resetgoal`.
- **Persistence**: Remembers progress even if you refresh the browser source.

## File Structure
- `widget.json`: The settings schema (StreamElements uses this to build the editor UI).
- `widget.html`: The HTML structure.
- `widget.css`: The styling.
- `widget.js`: The logic.

## Installation Logic

1. Go to **StreamElements Dashboard** -> **Streaming Tools** -> **Overlays**.
2. Create a **New Overlay** (set resolution to 1080p).
3. Click **Add Widget** -> **Static / Custom** -> **Custom Widget**.
4. Click **Open Editor** on the new widget.
5. You will see tabs for HTML, CSS, JS, Fields (JSON), and Data.
6. **Copy & Paste** the contents of the files provided here into the respective tabs:
   - `widget.html` -> **HTML** tab
   - `widget.css` -> **CSS** tab
   - `widget.js` -> **JS** tab
   - `widget.json` -> **FIELDS** tab
7. Click **Done**.

## Configuration

### Appearance
- **Widget Style**: Choose between `widget1` (Text Focus), `widget2` (Image Focus), `widget3` (Arch), `widget4` (Open Loop).
- **Appearance Mode**: `Solid` for flat colors, `Gradient + Neon` for the glow effect shown in screenshots.
- **Colors**: Pick Primary, Secondary (for gradient), Track (background), and Glow colors.

### Goal Settings
- **Goal Value**: The target number (e.g., 100 subs).
- **Starting Progress**: Initial value (e.g., 0).
- **Event Type**: Choose what triggers progress (Subscriber, Follower, Tip, etc.).

### Chat Commands
If enabled, Broadcasters and Moderators can use:
- `!add <number>` : Add to current progress (e.g., `!add 5`).
- `!subtract <number>` : Remove progress.
- `!setprogress <number>` : Force set the current value.
- `!setgoal <number>` : Force set the target value.
- `!resetgoal` : Reset progress to 0.

## Images
You can upload a custom image (e.g., the hedgehog or drink from the screenshots) in the **Center Image** setting. 
- Use **Image Shape** to mask it as a Circle, Square, or leave it distinct.

## Troubleshooting
- **Font not loading?** The widget uses Google Fonts. If they don't appear in the SE Editor, they usually work in OBS.
- **Glow cut off?** Increase the widget box size in the StreamElements designer or reduce the `Widget Size` in settings.

## Developer Note
The widget uses `SE_API.store` to save your progress automatically. If you need to wipe all data, use the **Reset Saved Data** button in the settings or type `!resetgoal` in chat.
