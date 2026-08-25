# Hermes Custom Wallpaper Glass

A standalone [Hermes Desktop](https://hermes-agent.nousresearch.com/) plugin that adds a full-window wallpaper with readable glass panels and a visual settings page.

## Features

- Native macOS image picker — no manual path editing required
- PNG, JPG/JPEG, WebP, GIF and BMP support
- Full-window `cover`, `contain` or `fill` layout
- Position control: center, top, bottom, left or right
- Wallpaper opacity and blur
- Chat, sidebar and message-card tint controls
- Sidebar and message-card blur controls
- Immediate preview with plugin-scoped persistent settings
- No background image is bundled or uploaded

## Install

1. Create the plugin directory:

   ```sh
   mkdir -p "$HOME/.hermes/desktop-plugins/custom-wallpaper-glass"
   ```

2. Download `plugin.js` from this repository into that directory.

3. In Hermes Desktop, run **⌘K → Reload desktop plugins**.

4. Open **壁纸设置 / Wallpaper Settings** in the left navigation.

5. Click **选择图片 / Choose image** and select a local image.

The plugin reads the selected image through Hermes Desktop's native file bridge. The image stays local and is not committed to this repository.

## Development

```sh
node --check plugin.js
```

The runtime plugin uses only the Hermes plugin SDK and React runtime shims. It is a plain ESM JavaScript file and does not require a build step.

## Notes

- The plugin stores settings in its namespaced plugin storage.
- If an older copy is already installed, replace its `plugin.js` and reload desktop plugins.
- The plugin is designed for Hermes Desktop, not the CLI or TUI.

## License

MIT
