import { jsx } from 'react/jsx-runtime'
import { useState } from 'react'
import { host } from '@hermes/plugin-sdk'

const ID = 'custom-wallpaper-glass'
const STYLE_ID = 'hermes-custom-wallpaper-style'
const WALLPAPER_ID = 'hermes-custom-wallpaper-image'
const MARKER_ID = 'hermes-custom-wallpaper-active'
const ROOT_ATTR = 'data-hermes-wallpaper'
const DEFAULT_IMAGE_PATH = ''
const SETTINGS_KEY = 'settings.v1'
const DEFAULTS = {
  enabled: true,
  imagePath: DEFAULT_IMAGE_PATH,
  fit: 'cover',
  position: 'center center',
  imageOpacity: 100,
  imageBlur: 0,
  chatTint: 72,
  sidebarTint: 78,
  sidebarBlur: 12,
  messageTint: 88,
  messageBlur: 8,
  botsTint: 78,
  jobsTint: 78,
  settingsTint: 86
}

const clamp = value => Math.max(0, Math.min(100, Number(value) || 0))
const settingsCss = s => `
  --wallpaper-fit: ${s.fit};
  --wallpaper-position: ${s.position};
  --wallpaper-opacity: ${clamp(s.imageOpacity) / 100};
  --wallpaper-blur: ${Math.max(0, Number(s.imageBlur) || 0)}px;
  --wallpaper-chat-tint: ${clamp(s.chatTint)}%;
  --wallpaper-sidebar-tint: ${clamp(s.sidebarTint)}%;
  --wallpaper-sidebar-blur: ${Math.max(0, Number(s.sidebarBlur) || 0)}px;
  --wallpaper-message-tint: ${clamp(s.messageTint)}%;
  --wallpaper-message-blur: ${Math.max(0, Number(s.messageBlur) || 0)}px;
  --wallpaper-bots-tint: ${clamp(s.botsTint)}%;
  --wallpaper-jobs-tint: ${clamp(s.jobsTint)}%;
  --wallpaper-settings-tint: ${clamp(s.settingsTint)}%;
`

function WallpaperSettingsPage({ ctx, initial, applySettings, loadImage }) {
  const [settings, setSettings] = useState(initial)
  const [status, setStatus] = useState('Ready')
  const update = patch => {
    const next = { ...settings, ...patch }
    setSettings(next)
    ctx.storage.set(SETTINGS_KEY, next)
    applySettings(next)
  }
  const slider = (label, key, max = 100, suffix = '%') => jsx('label', { className: 'grid gap-1', children: [
    jsx('span', { className: 'flex justify-between text-xs', children: [label, `${settings[key]}${suffix}`] }),
    jsx('input', { type: 'range', min: 0, max, value: settings[key], onChange: event => update({ [key]: Number(event.target.value) }) })
  ] })
  return jsx('div', { style: { height: '100%', overflow: 'auto', padding: '28px', background: 'var(--ui-chat-surface-background)', color: 'var(--ui-text-primary)' }, children: jsx('div', { style: { maxWidth: '760px', margin: '0 auto', display: 'grid', gap: '20px' }, children: [
    jsx('div', { children: [jsx('h1', { children: 'Wallpaper' }), jsx('p', { children: 'Keeps your current theme. Tints only control how much of the image shows through. Changes preview immediately and save automatically.' })] }),
    jsx('section', { style: { padding: '20px', border: '1px solid var(--ui-stroke-secondary)', borderRadius: '12px', background: 'var(--ui-editor-surface-background)' }, children: [
      jsx('h2', { children: 'Background image' }),
      jsx('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [
        jsx('button', {
          style: { height: '36px', padding: '0 16px', borderRadius: '8px', border: '1px solid var(--ui-stroke-secondary)', background: 'var(--ui-accent)', color: 'var(--dt-primary-foreground)', cursor: 'pointer' },
          onClick: async () => {
            const paths = await window.hermesDesktop?.selectPaths({
              title: 'Choose wallpaper image',
              multiple: false,
              defaultPath: settings.imagePath,
              filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'] }]
            })
            const imagePath = paths?.[0]
            if (!imagePath) return
            setSettings({ ...settings, imagePath })
            setStatus('Reading image…')
            try { await loadImage(imagePath); setStatus('Image applied') }
            catch (error) { setStatus(error instanceof Error ? error.message : String(error)) }
          },
          children: 'Choose image'
        }),
        jsx('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ui-text-secondary)', fontSize: '12px' }, title: settings.imagePath, children: settings.imagePath.split(/[/\\]/).pop() || 'No image selected' })
      ] }),
      jsx('p', { children: status }), slider('Image opacity', 'imageOpacity'), slider('Image blur', 'imageBlur', 30, 'px'),
      jsx('label', { children: ['Fit ', jsx('select', { value: settings.fit, onChange: event => update({ fit: event.target.value }), children: [jsx('option', { value: 'cover', children: 'Cover' }), jsx('option', { value: 'contain', children: 'Contain' }), jsx('option', { value: 'fill', children: 'Stretch' })] })] }),
      jsx('label', { children: ['Position ', jsx('select', { value: settings.position, onChange: event => update({ position: event.target.value }), children: [jsx('option', { value: 'center center', children: 'Center' }), jsx('option', { value: 'center top', children: 'Top' }), jsx('option', { value: 'center bottom', children: 'Bottom' }), jsx('option', { value: 'left center', children: 'Left' }), jsx('option', { value: 'right center', children: 'Right' })] })] })
    ] }),
    jsx('section', { style: { padding: '20px', border: '1px solid var(--ui-stroke-secondary)', borderRadius: '12px', background: 'var(--ui-editor-surface-background)', display: 'grid', gap: '14px' }, children: [jsx('h2', { children: 'Readability' }), slider('Chat tint', 'chatTint'), slider('Sidebar tint', 'sidebarTint'), slider('Bots tint', 'botsTint'), slider('Scheduled jobs tint', 'jobsTint'), slider('Settings window tint', 'settingsTint'), slider('Message tint', 'messageTint'), slider('Sidebar blur', 'sidebarBlur', 30, 'px'), slider('Message blur', 'messageBlur', 30, 'px')] })
  ] }) })
}


export default {
  id: ID,
  name: 'Custom Wallpaper Glass',
  description: 'Full-window wallpaper that keeps the active theme. Glass tints use theme surfaces instead of a custom palette.',
  register(ctx) {
    let disposed = false
    let settings = { ...DEFAULTS, ...ctx.storage.get(SETTINGS_KEY, {}) }
    const root = document.documentElement
    const previousAttr = root.getAttribute(ROOT_ATTR)

    document.getElementById(STYLE_ID)?.remove()
    document.getElementById(WALLPAPER_ID)?.remove()
    document.getElementById(MARKER_ID)?.remove()

    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
      :root[${ROOT_ATTR}],
      :root[${ROOT_ATTR}] body,
      :root[${ROOT_ATTR}] #root,
      :root[${ROOT_ATTR}] [data-contrib-shell],
      :root[${ROOT_ATTR}] [data-slot='sidebar-wrapper'] {
        background-color: transparent !important;
        background-image: none !important;
      }

      :root[${ROOT_ATTR}] body {
        position: relative;
      }

      :root[${ROOT_ATTR}] #${WALLPAPER_ID} {
        position: fixed;
        inset: 0;
        z-index: 0;
        display: block;
        width: 100vw;
        height: 100vh;
        max-width: none;
        max-height: none;
        object-fit: var(--wallpaper-fit, cover);
        object-position: var(--wallpaper-position, center center);
        pointer-events: none;
        user-select: none;
        opacity: var(--wallpaper-opacity, 1);
        filter: blur(var(--wallpaper-blur, 0px));
      }

      :root[${ROOT_ATTR}] #root {
        position: relative;
        z-index: 1;
      }

      /* Glass only. Accent, text, and selection stay on the active skin. */
      :root[${ROOT_ATTR}] {
        --ui-chat-surface-background: color-mix(in srgb, var(--ui-bg-chrome) var(--wallpaper-chat-tint, 72%), transparent);
        --ui-editor-surface-background: color-mix(in srgb, var(--ui-bg-chrome) var(--wallpaper-chat-tint, 72%), transparent);
        --ui-sidebar-surface-background: color-mix(in srgb, var(--ui-bg-sidebar) var(--wallpaper-sidebar-tint, 78%), transparent);
        --ui-widget-surface-background: color-mix(in srgb, var(--ui-bg-editor) var(--wallpaper-message-tint, 88%), transparent);
      }

      :root[${ROOT_ATTR}] [data-chat-surface] {
        background-color: var(--ui-chat-surface-background) !important;
        background-image: none !important;
      }

      :root[${ROOT_ATTR}] [data-slot='sidebar'],
      :root[${ROOT_ATTR}] [data-slot='statusbar'] {
        background-color: var(--ui-sidebar-surface-background) !important;
        -webkit-backdrop-filter: blur(var(--wallpaper-sidebar-blur, 12px));
        backdrop-filter: blur(var(--wallpaper-sidebar-blur, 12px));
      }

      :root[${ROOT_ATTR}] [data-slot='sidebar-content'],
      :root[${ROOT_ATTR}] [data-slot='sidebar-inner'] {
        background: transparent !important;
      }

      :root[${ROOT_ATTR}] [data-slot='aui_assistant-message-content'],
      :root[${ROOT_ATTR}] [data-slot='composer-surface'],
      :root[${ROOT_ATTR}] [data-slot='code-card'],
      :root[${ROOT_ATTR}] [data-slot='tool-block'],
      :root[${ROOT_ATTR}] [data-slot='aui_thinking-disclosure'] {
        background-color: color-mix(in srgb, var(--ui-bg-editor) var(--wallpaper-message-tint, 88%), transparent);
        -webkit-backdrop-filter: blur(var(--wallpaper-message-blur, 8px));
        backdrop-filter: blur(var(--wallpaper-message-blur, 8px));
      }

      /* Bots tab: the sessions zone stays solid until that pane is the visible one. */
      :root[${ROOT_ATTR}] [data-tree-group]:has([data-pane-host='hermes-bots:pane']:not([inert])),
      :root[${ROOT_ATTR}] [data-tree-group]:has([data-pane-host='hermes-bots:pane']:not([inert])) [data-panel-header],
      :root[${ROOT_ATTR}] [data-tree-tab='hermes-bots:pane'],
      :root[${ROOT_ATTR}] [data-panel-header]:has([data-tree-tab='hermes-bots:pane']),
      :root[${ROOT_ATTR}] [role='tablist']:has([data-tree-tab='hermes-bots:pane']) {
        background-color: color-mix(in srgb, var(--ui-bg-sidebar) var(--wallpaper-bots-tint, 78%), transparent) !important;
        --tab-bg: color-mix(in srgb, var(--ui-bg-sidebar) var(--wallpaper-bots-tint, 78%), transparent);
      }

      /* Scheduled jobs: the bot routines pane, its tab, and the cron overlay. */
      :root[${ROOT_ATTR}] [data-tree-group]:has([data-pane-host='hermes-bots:routines']:not([inert])),
      :root[${ROOT_ATTR}] [data-tree-group]:has([data-pane-host='hermes-bots:routines']:not([inert])) [data-panel-header],
      :root[${ROOT_ATTR}] [data-tree-tab='hermes-bots:routines'],
      :root[${ROOT_ATTR}] [data-panel-header]:has([data-tree-tab='hermes-bots:routines']),
      :root[${ROOT_ATTR}] [role='tablist']:has([data-tree-tab='hermes-bots:routines']) {
        background-color: color-mix(in srgb, var(--ui-bg-chrome) var(--wallpaper-jobs-tint, 78%), transparent) !important;
        --tab-bg: color-mix(in srgb, var(--ui-bg-chrome) var(--wallpaper-jobs-tint, 78%), transparent);
      }

      :root[${ROOT_ATTR}] [data-overlay-surface] {
        background-color: transparent !important;
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }

      :root[${ROOT_ATTR}][data-wallpaper-route='/settings'] [data-overlay-surface] [data-glass-raised] {
        background-color: color-mix(in srgb, var(--ui-bg-chrome) var(--wallpaper-settings-tint, 86%), transparent) !important;
      }

      :root[${ROOT_ATTR}][data-wallpaper-route='/settings'] [data-overlay-surface] [data-tour='overlay-nav'] {
        background-color: color-mix(in srgb, var(--ui-bg-sidebar) var(--wallpaper-settings-tint, 86%), transparent) !important;
      }

      :root[${ROOT_ATTR}][data-wallpaper-route='/cron'] [data-overlay-surface] [data-glass-raised] {
        background-color: color-mix(in srgb, var(--ui-bg-chrome) var(--wallpaper-jobs-tint, 78%), transparent) !important;
      }
    `
    document.head.appendChild(style)

    const applySettings = next => {
      settings = { ...settings, ...next }
      root.style.cssText += settingsCss(settings)
      root.toggleAttribute(ROOT_ATTR, Boolean(settings.enabled && settings.imagePath))
    }
    applySettings(settings)

    const syncRoute = () => {
      const path = (location.hash || '').replace(/^#/, '').split('?')[0]
      if (path === '/settings' || path === '/cron') root.dataset.wallpaperRoute = path
      else delete root.dataset.wallpaperRoute
    }
    window.addEventListener('hashchange', syncRoute)
    syncRoute()

    const wallpaper = document.createElement('img')
    wallpaper.id = WALLPAPER_ID
    wallpaper.alt = ''
    wallpaper.setAttribute('aria-hidden', 'true')
    wallpaper.draggable = false
    document.body.prepend(wallpaper)

    const loadImage = async imagePath => {
      const dataUrl = await window.hermesDesktop?.readFileDataUrl(imagePath)
      if (!dataUrl) throw new Error('This desktop build cannot read that image')
      wallpaper.src = dataUrl
      try { await wallpaper.decode() } catch {}
      if (!wallpaper.naturalWidth || !wallpaper.naturalHeight) throw new Error('Image format could not be decoded')
      settings = { ...settings, imagePath }
      ctx.storage.set(SETTINGS_KEY, settings)
      root.toggleAttribute(ROOT_ATTR, Boolean(settings.enabled && settings.imagePath))
      return wallpaper
    }

    ctx.registerMany([
      { id: 'page', area: 'routes', data: { path: '/wallpaper-settings' }, render: () => jsx(WallpaperSettingsPage, { ctx, initial: settings, applySettings, loadImage }) },
      { id: 'nav', area: 'sidebar.nav', order: 70, data: { codicon: 'symbol-color', label: 'Wallpaper', path: '/wallpaper-settings' } }
    ])

    if (settings.imagePath) {
      void loadImage(settings.imagePath)
        .then(async () => {
        root.setAttribute(ROOT_ATTR, 'true')

        const marker = document.createElement('span')
        marker.id = MARKER_ID
        marker.setAttribute('role', 'status')
        marker.setAttribute(
          'aria-label',
          `Wallpaper rendered: ${wallpaper.naturalWidth}x${wallpaper.naturalHeight}`
        )
        marker.dataset.imageLoaded = 'true'
        marker.style.cssText =
          'position:fixed;left:0;bottom:0;width:1px;height:1px;overflow:hidden;opacity:0.001;pointer-events:none;'
        document.body.appendChild(marker)

        requestAnimationFrame(() => {
          const chat = document.querySelector('[data-chat-surface]')
          const sidebar = document.querySelector('[data-slot="sidebar"]')
          const assistant = document.querySelector('[data-slot="aui_assistant-message-content"]')
          const chatStyle = chat ? getComputedStyle(chat) : null
          const sidebarStyle = sidebar ? getComputedStyle(sidebar) : null
          const assistantStyle = assistant ? getComputedStyle(assistant) : null

          marker.dataset.readabilityApplied = String(
            chatStyle?.backgroundColor.includes('0.1') &&
              sidebarStyle?.backgroundColor.includes('0.72') &&
              assistantStyle?.backgroundColor.includes('0.7')
          )
        })
      })
      .catch(error => {
        if (!disposed) {
          host.notify({
            kind: 'error',
            message: `Wallpaper failed to load: ${error instanceof Error ? error.message : String(error)}`
          })
        }
      })
    }

    ctx.onDispose(() => {
      disposed = true
      window.removeEventListener('hashchange', syncRoute)
      delete root.dataset.wallpaperRoute
      style.remove()
      wallpaper.remove()
      document.getElementById(MARKER_ID)?.remove()

      if (previousAttr === null) root.removeAttribute(ROOT_ATTR)
      else root.setAttribute(ROOT_ATTR, previousAttr)
    })
  }
}
