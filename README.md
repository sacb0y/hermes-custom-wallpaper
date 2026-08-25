# Hermes Custom Wallpaper Glass

A standalone Hermes Desktop plugin that adds a configurable wallpaper layer and a visual settings page.

## Features

- Native macOS image picker — no path editing required
- PNG, JPG/JPEG, WebP, GIF, and BMP support
- Full-window `cover`, `contain`, or `fill` modes
- Image opacity and blur controls
- Chat, sidebar, and message-card tint controls
- Sidebar and message-card blur controls
- Live preview with plugin-scoped automatic persistence
- Wallpaper Settings entry in the Hermes sidebar

## Install

1. Download `plugin.js` from this repository.
2. Create the plugin directory:

   ```text
   ~/.hermes/desktop-plugins/custom-wallpaper-glass/
   ```

3. Put `plugin.js` in that directory.
4. Open Hermes and run **⌘K → Reload desktop plugins**.
5. Open **Wallpaper Settings** from the Hermes sidebar.
6. Click **Choose Image** and select a local image.

The plugin intentionally does not ship with a wallpaper image. Each user selects their own image from the visual settings page.

## Compatibility

Requires a Hermes Desktop build with:

- Runtime desktop plugins
- `ROUTES_AREA` and `SIDEBAR_NAV_AREA`
- `window.hermesDesktop.selectPaths`
- `window.hermesDesktop.readFileDataUrl`

## Notes

This plugin uses the Hermes Desktop plugin SDK and is intended for local installation. Settings are stored in the plugin's namespaced storage and are not written into `config.yaml`.

## License

MIT
