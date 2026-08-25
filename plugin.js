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
  chatTint: 10,
  sidebarTint: 72,
  sidebarBlur: 16,
  messageTint: 70,
  messageBlur: 12,
  accent: '#b52f49'
}

const clamp = value => Math.max(0, Math.min(100, Number(value) || 0))
const settingsCss = s => `
  --wallpaper-fit: ${s.fit};
  --wallpaper-position: ${s.position};
  --wallpaper-opacity: ${clamp(s.imageOpacity) / 100};
  --wallpaper-blur: ${Math.max(0, Number(s.imageBlur) || 0)}px;
  --wallpaper-chat-tint: ${clamp(s.chatTint) / 100};
  --wallpaper-sidebar-tint: ${clamp(s.sidebarTint) / 100};
  --wallpaper-sidebar-blur: ${Math.max(0, Number(s.sidebarBlur) || 0)}px;
  --wallpaper-message-tint: ${clamp(s.messageTint) / 100};
  --wallpaper-message-blur: ${Math.max(0, Number(s.messageBlur) || 0)}px;
  --wallpaper-accent: ${s.accent};
`

function WallpaperSettingsPage({ ctx, initial, applySettings, loadImage }) {
  const [settings, setSettings] = useState(initial)
  const [status, setStatus] = useState('已加载')
  const update = patch => {
    const next = { ...settings, ...patch }
    setSettings(next)
    ctx.storage.set(SETTINGS_KEY, next)
    applySettings(next)
  }
  const applyPath = async () => {
    setStatus('读取图片中…')
    try { await loadImage(settings.imagePath); setStatus('图片已应用') }
    catch (error) { setStatus(error instanceof Error ? error.message : String(error)) }
  }
  const slider = (label, key, max = 100, suffix = '%') => jsx('label', { className: 'grid gap-1', children: [
    jsx('span', { className: 'flex justify-between text-xs', children: [label, `${settings[key]}${suffix}`] }),
    jsx('input', { type: 'range', min: 0, max, value: settings[key], onChange: event => update({ [key]: Number(event.target.value) }) })
  ] })
  return jsx('div', { style: { height: '100%', overflow: 'auto', padding: '28px', background: 'var(--ui-chat-surface-background)', color: 'var(--ui-text-primary)' }, children: jsx('div', { style: { maxWidth: '760px', margin: '0 auto', display: 'grid', gap: '20px' }, children: [
    jsx('div', { children: [jsx('h1', { children: '壁纸设置' }), jsx('p', { children: '调整后立即预览并自动保存。' })] }),
    jsx('section', { style: { padding: '20px', border: '1px solid var(--ui-stroke-secondary)', borderRadius: '12px', background: 'var(--ui-editor-surface-background)' }, children: [
      jsx('h2', { children: '背景图片' }),
      jsx('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [
        jsx('button', {
          style: { height: '36px', padding: '0 16px', borderRadius: '8px', border: '1px solid var(--ui-stroke-secondary)', background: 'var(--ui-accent)', color: 'white', cursor: 'pointer' },
          onClick: async () => {
            const paths = await window.hermesDesktop?.selectPaths({
              title: '选择壁纸图片',
              multiple: false,
              defaultPath: settings.imagePath,
              filters: [{ name: '图片', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'] }]
            })
            const imagePath = paths?.[0]
            if (!imagePath) return
            setSettings({ ...settings, imagePath })
            setStatus('读取图片中…')
            try { await loadImage(imagePath); setStatus('图片已应用') }
            catch (error) { setStatus(error instanceof Error ? error.message : String(error)) }
          },
          children: '选择图片'
        }),
        jsx('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ui-text-secondary)', fontSize: '12px' }, title: settings.imagePath, children: settings.imagePath.split('/').pop() || '未选择图片' })
      ] }),
      jsx('p', { children: status }), slider('图片可见度', 'imageOpacity'), slider('图片模糊', 'imageBlur', 30, 'px'),
      jsx('label', { children: ['填充方式 ', jsx('select', { value: settings.fit, onChange: event => update({ fit: event.target.value }), children: [jsx('option', { value: 'cover', children: '覆盖窗口' }), jsx('option', { value: 'contain', children: '完整显示' }), jsx('option', { value: 'fill', children: '拉伸填满' })] })] }),
      jsx('label', { children: ['对齐位置 ', jsx('select', { value: settings.position, onChange: event => update({ position: event.target.value }), children: [jsx('option', { value: 'center center', children: '居中' }), jsx('option', { value: 'center top', children: '顶部' }), jsx('option', { value: 'center bottom', children: '底部' }), jsx('option', { value: 'left center', children: '左侧' }), jsx('option', { value: 'right center', children: '右侧' })] })] })
    ] }),
    jsx('section', { style: { padding: '20px', border: '1px solid var(--ui-stroke-secondary)', borderRadius: '12px', background: 'var(--ui-editor-surface-background)', display: 'grid', gap: '14px' }, children: [jsx('h2', { children: '可读性' }), slider('聊天区域遮罩', 'chatTint'), slider('侧栏遮罩', 'sidebarTint'), slider('消息卡遮罩', 'messageTint'), slider('侧栏模糊', 'sidebarBlur', 30, 'px'), slider('消息卡模糊', 'messageBlur', 30, 'px')] })
  ] }) })
}


export default {
  id: ID,
  name: 'Custom Wallpaper Glass',
  description: 'Full-window wallpaper with clear chat and frosted side panels.',
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

      :root[${ROOT_ATTR}] {
        /* Palette sampled from the wallpaper: ink + warm paper + crimson. */
        --ui-accent: var(--wallpaper-accent, #b52f49);
        --dt-primary: var(--wallpaper-accent, #b52f49);
        --dt-ring: #c7435b;
        --ui-text-primary: #24191c;
        --ui-text-secondary: #4d3d41;
        --ui-text-tertiary: #766267;
        --ui-text-quaternary: #9b858a;
        --dt-foreground: #24191c;
        --dt-muted-foreground: #6d5b60;
        --ui-control-active-background: rgb(181 47 73 / 0.14);
        --ui-control-hover-background: rgb(181 47 73 / 0.09);
        --ui-selection-background: rgb(181 47 73 / 0.24);
        --ui-chat-surface-background: rgb(255 250 249 / var(--wallpaper-chat-tint, 0.10));
        --ui-editor-surface-background: rgb(255 252 251 / 0.82);
        --ui-sidebar-surface-background: rgb(252 247 247 / var(--wallpaper-sidebar-tint, 0.72));
        --ui-widget-surface-background: rgb(255 252 251 / 0.88);
        --composer-fill: rgb(255 253 252 / 0.92);
      }

      :root[${ROOT_ATTR}] [data-chat-surface] {
        background-color: rgb(255 250 249 / var(--wallpaper-chat-tint, 0.10)) !important;
        background-image: none !important;
        opacity: 1 !important;
        filter: none !important;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      :root[${ROOT_ATTR}] [data-chat-surface]::before {
        display: none !important;
      }

      :root[${ROOT_ATTR}] [data-slot='sidebar'],
      :root[${ROOT_ATTR}] aside[aria-label],
      :root[${ROOT_ATTR}] [data-slot='statusbar'] {
        background-color: rgb(252 247 247 / var(--wallpaper-sidebar-tint, 0.72)) !important;
        -webkit-backdrop-filter: blur(var(--wallpaper-sidebar-blur, 16px)) saturate(0.94);
        backdrop-filter: blur(var(--wallpaper-sidebar-blur, 16px)) saturate(0.94);
      }

      :root[${ROOT_ATTR}] [data-slot='sidebar-content'],
      :root[${ROOT_ATTR}] [data-slot='sidebar-inner'] {
        background: transparent !important;
      }

      /* Keep the wallpaper clear between turns; each reply carries its own
         readable paper-glass card instead of bleaching the whole workspace. */
      :root[${ROOT_ATTR}] [data-slot='aui_assistant-message-content'] {
        margin-block: 0.25rem;
        padding: 0.875rem 1rem;
        border: 1px solid rgb(120 35 51 / 0.14);
        border-radius: 0.875rem;
        background-color: rgb(255 253 252 / var(--wallpaper-message-tint, 0.70)) !important;
        box-shadow: 0 0.5rem 1.5rem rgb(62 20 28 / 0.08);
        -webkit-backdrop-filter: blur(var(--wallpaper-message-blur, 12px)) saturate(0.94);
        backdrop-filter: blur(var(--wallpaper-message-blur, 12px)) saturate(0.94);
      }

      :root[${ROOT_ATTR}] [data-slot='composer-surface'],
      :root[${ROOT_ATTR}] [data-slot='code-card'],
      :root[${ROOT_ATTR}] [data-slot='tool-block'],
      :root[${ROOT_ATTR}] [data-slot='aui_thinking-disclosure'],
      :root[${ROOT_ATTR}] [data-slot='aui_user-message-root'] > div {
        background-color: rgb(255 253 252 / 0.90) !important;
        border-color: rgb(120 35 51 / 0.16) !important;
        -webkit-backdrop-filter: blur(16px) saturate(0.92);
        backdrop-filter: blur(16px) saturate(0.92);
      }

      :root[${ROOT_ATTR}] [data-slot='composer-root'] > .pointer-events-none {
        background: linear-gradient(to bottom, transparent, rgb(255 248 247 / 0.48)) !important;
      }
    `
    document.head.appendChild(style)

    const applySettings = next => {
      settings = { ...settings, ...next }
      root.style.cssText += settingsCss(settings)
      root.toggleAttribute(ROOT_ATTR, settings.enabled)
    }
    applySettings(settings)

    const wallpaper = document.createElement('img')
    wallpaper.id = WALLPAPER_ID
    wallpaper.alt = ''
    wallpaper.setAttribute('aria-hidden', 'true')
    wallpaper.draggable = false
    document.body.prepend(wallpaper)

    const loadImage = async imagePath => {
      const dataUrl = await window.hermesDesktop?.readFileDataUrl(imagePath)
      if (!dataUrl) throw new Error('当前桌面环境无法读取该图片')
      wallpaper.src = dataUrl
      try { await wallpaper.decode() } catch {}
      if (!wallpaper.naturalWidth || !wallpaper.naturalHeight) throw new Error('图片格式无法解码')
      settings = { ...settings, imagePath }
      ctx.storage.set(SETTINGS_KEY, settings)
      root.toggleAttribute(ROOT_ATTR, settings.enabled)
      return wallpaper
    }

    ctx.registerMany([
      { id: 'page', area: 'routes', data: { path: '/wallpaper-settings' }, render: () => jsx(WallpaperSettingsPage, { ctx, initial: settings, applySettings, loadImage }) },
      { id: 'nav', area: 'sidebar.nav', order: 70, data: { codicon: 'symbol-color', label: '壁纸设置', path: '/wallpaper-settings' } }
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
          `壁纸已渲染：${wallpaper.naturalWidth}x${wallpaper.naturalHeight}；窗口层=${wallpaper.clientWidth}x${wallpaper.clientHeight}`
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
      style.remove()
      wallpaper.remove()
      document.getElementById(MARKER_ID)?.remove()

      if (previousAttr === null) root.removeAttribute(ROOT_ATTR)
      else root.setAttribute(ROOT_ATTR, previousAttr)
    })
  }
}
