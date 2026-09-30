# Hermes Custom Wallpaper Glass

A standalone [Hermes Desktop](https://hermes-agent.nousresearch.com/) plugin that adds a full-window wallpaper with readable glass panels and a visual settings page.

This is a fork of [White-zhang-xiao-bai/hermes-custom-wallpaper](https://github.com/White-zhang-xiao-bai/hermes-custom-wallpaper). The glass still lets a local image show through, but it no longer replaces the active theme with a hardcoded crimson and paper palette.

## Features

- Native image picker through Hermes Desktop's file bridge (macOS and Windows)
- PNG, JPG/JPEG, WebP, GIF and BMP support
- Full-window `cover`, `contain` or `fill` layout
- Position control: center, top, bottom, left or right
- Wallpaper opacity and blur
- Chat, sidebar and message tint controls, mixed from the active theme surfaces
- Sidebar and message blur controls
- English settings page
- Immediate preview with plugin-scoped persistent settings
- No background image is bundled or uploaded
- Wallpaper styling stays off until an image is chosen, so installing it does not recolor the app

## Install

1. Create the plugin directory. Use `HERMES_HOME` when it is set. On Windows that is usually `%LOCALAPPDATA%\hermes`, not `%USERPROFILE%\.hermes`.

   ```sh
   mkdir -p "${HERMES_HOME:-$HOME/.hermes}/desktop-plugins/custom-wallpaper-glass"
   ```

   Or, from a clone of this repo:

   ```sh
   sh install.sh
   ```

2. If you did not run `install.sh`, download `plugin.js` from this repository into that directory. The folder name must stay `custom-wallpaper-glass`.

3. In Hermes Desktop, run **Ctrl+K** (macOS: **⌘K**) → **Reload desktop plugins**. The app also watches the folder, so a new copy often loads on its own.

4. Open **Wallpaper** in the left navigation.

5. Click **Choose image** and select a local image.

The plugin reads the selected image through Hermes Desktop's native file bridge. The image stays local and is not committed to this repository.

Chat tint defaults to 72% so the theme stays readable. Lower it if you want more of the picture showing through.

## Development

```sh
node --check plugin.js
```

The runtime plugin uses only the Hermes plugin SDK and React runtime shims. It is a plain ESM JavaScript file and does not require a build step.

## Notes

- The plugin stores settings in its namespaced plugin storage.
- If an older copy is already installed, replace its `plugin.js` and reload desktop plugins.
- The plugin is designed for Hermes Desktop, not the CLI or TUI.
- Glass tints use `--ui-bg-chrome`, `--ui-bg-sidebar`, and `--ui-bg-editor`. Accent, text, and selection colors are left alone.

## License

MIT. Original work by [White-zhang-xiao-bai](https://github.com/White-zhang-xiao-bai/hermes-custom-wallpaper).
