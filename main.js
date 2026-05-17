const { app, BrowserWindow, globalShortcut, session } = require('electron');
const fs = require('fs');
const path = require('path');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const BOUNDS_PATH = path.join(__dirname, 'bounds.json');

const THEME_BASE = 'https://thepolishdane.github.io/stream-overlays';

const WINDOWS = [
  {
    id: 'chat',
    bounds: { x: 50, y: 50, width: 380, height: 600 },
    buildUrl: (cfg) => {
      const params = new URLSearchParams({
        session: cfg.session,
        server2: '',
        showtime: '0',
        limitbadges: '2',
        isdock: 'true',
        fadezone: '0',
        viewonly: 'true',
        scroll: 'true',
        capture: 'true'
      });
      if (cfg.twitchChannel) params.set('twitchchannel', cfg.twitchChannel);
      return `${THEME_BASE}/chat.html?${params.toString()}`;
    }
  },
  {
    id: 'activity',
    bounds: { x: 50, y: 680, width: 380, height: 320 },
    buildUrl: (cfg) => {
      const params = new URLSearchParams({
        session: cfg.session,
        server2: '',
        isdock: 'true',
        scroll: 'true'
      });
      if (cfg.streamElementsJwt) params.set('se_jwt', cfg.streamElementsJwt);
      return `${THEME_BASE}/activity.html?${params.toString()}`;
    }
  }
];

function loadJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}
function saveJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

const config = loadJson(CONFIG_PATH, null);
const savedBounds = loadJson(BOUNDS_PATH, {});

if (!config || !config.session) {
  console.error('config.json missing or has no `session` field. Copy config.example.json to config.json and edit.');
  app.quit();
}

const windows = [];
let editMode = false;
let visible = true;

function createOverlay(spec) {
  const b = savedBounds[spec.id] || spec.bounds;
  const url = spec.buildUrl(config);

  const win = new BrowserWindow({
    x: b.x, y: b.y, width: b.width, height: b.height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    fullscreenable: false,
    minimizable: false,
    title: `SSN Overlay - ${spec.id}`,
    webPreferences: {
      contextIsolation: true,
      backgroundThrottling: false
    }
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadURL(url);
  win.setIgnoreMouseEvents(true, { forward: true });

  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(`
      html, body {
        user-select: none !important;
        -webkit-user-select: none !important;
      }
      * { -webkit-user-drag: none; }
    `);
    win.webContents.executeJavaScript(`
      (function killBg() {
        const clear = () => {
          [document.documentElement, document.body].forEach(el => {
            if (!el) return;
            el.style.setProperty('background', 'transparent', 'important');
            el.style.setProperty('background-color', 'transparent', 'important');
          });
        };
        clear();
        const mo = new MutationObserver(clear);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
        if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ['style'] });
        setTimeout(clear, 500);
        setTimeout(clear, 2000);
      })();
    `);
  });

  const persist = () => {
    savedBounds[spec.id] = win.getBounds();
    saveJson(BOUNDS_PATH, savedBounds);
  };
  win.on('moved', persist);
  win.on('resized', persist);

  win.__spec = spec;
  return win;
}

async function enterEditMode() {
  if (editMode) return;
  editMode = true;
  for (const win of windows) {
    win.setIgnoreMouseEvents(false);
    const css = `
      html, body {
        -webkit-app-region: drag !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }
      a, button, input, select, textarea, .no-drag, [data-no-drag],
      .stats-pill, #capture-toggle, #capture-panel, #capture-panel * {
        -webkit-app-region: no-drag !important;
      }
      body::after {
        content: "EDIT MODE — drag anywhere to move, edge to resize, Ctrl+Shift+O to lock";
        position: fixed; bottom: 4px; left: 4px; right: 4px;
        padding: 4px 8px; font: 11px/1.2 sans-serif;
        background: rgba(0, 200, 100, 0.85); color: white;
        text-align: center; border-radius: 4px;
        pointer-events: none; z-index: 2147483647;
        -webkit-app-region: no-drag !important;
      }
      body { box-shadow: inset 0 0 0 2px rgba(0, 220, 120, 0.9) !important; }
    `;
    win.__editCssKey = await win.webContents.insertCSS(css);
  }
}

async function exitEditMode() {
  if (!editMode) return;
  editMode = false;
  for (const win of windows) {
    win.setIgnoreMouseEvents(true, { forward: true });
    if (win.__editCssKey) {
      try { await win.webContents.removeInsertedCSS(win.__editCssKey); } catch {}
      win.__editCssKey = null;
    }
  }
}

function toggleVisibility() {
  visible = !visible;
  for (const w of windows) visible ? w.showInactive() : w.hide();
}

app.whenReady().then(() => {
  if (!config || !config.session) return;

  session.defaultSession.on('will-download', (event, item) => {
    item.setSaveDialogOptions({
      defaultPath: item.getFilename(),
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
  });

  for (const spec of WINDOWS) windows.push(createOverlay(spec));

  globalShortcut.register('CommandOrControl+Shift+O', () => {
    editMode ? exitEditMode() : enterEditMode();
  });
  globalShortcut.register('CommandOrControl+Shift+H', toggleVisibility);
  globalShortcut.register('CommandOrControl+Shift+Q', () => app.quit());

  console.log(`SSN Desktop Overlay running for session "${config.session}".`);
  console.log('  Ctrl+Shift+O = toggle edit mode');
  console.log('  Ctrl+Shift+H = hide/show');
  console.log('  Ctrl+Shift+Q = quit');
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
