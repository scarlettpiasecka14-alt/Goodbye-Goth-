/* Goodbye Goth - desktop wrapper (Electron). It only opens the game in a window: the game itself is the files in ./game (a copy of the repo's index.html, css, js, assets).
   The game is served from a private app:// address so audio, video and the game's modules behave exactly as on the website, and localStorage (saves, settings) is kept in the user's data folder. */
const { app, BrowserWindow, protocol, net, Menu, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const GAME = path.join(__dirname, 'game');

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } }]);

function createWindow() {
    const win = new BrowserWindow({
        width: 1440, height: 810, minWidth: 960, minHeight: 540, useContentSize: true,
        backgroundColor: '#000000', title: 'Goodbye Goth', autoHideMenuBar: true,
        webPreferences: { autoplayPolicy: 'no-user-gesture-required', backgroundThrottling: false, spellcheck: false }
    });
    win.loadURL('app://game/index.html');
    win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
    // F11 / Ctrl+Cmd+F toggle fullscreen (the Settings button does too)
    win.webContents.on('before-input-event', (e, input) => {
        if (input.type !== 'keyDown') return;
        if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
        if (input.key === 'F3') {   // F3 = show / hide a small frame-rate counter (for finding out why the game feels slow)
            win.webContents.executeJavaScript(`(() => { let el = document.getElementById('gg-fps'); if (el) { el.remove(); clearInterval(window.__ggFps); return; }
              el = document.createElement('div'); el.id = 'gg-fps'; el.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99999;background:rgba(0,0,0,.75);color:#7CFC00;font:bold 14px monospace;padding:4px 8px;border-radius:6px;pointer-events:none';
              document.body.appendChild(el); let n = 0, worst = 0, last = performance.now(), t0 = last;
              const tick = (t) => { n++; worst = Math.max(worst, t - last); last = t; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
              window.__ggFps = setInterval(() => { const now = performance.now(); el.textContent = Math.round(n / ((now - t0) / 1000)) + ' fps, worst frame ' + Math.round(worst) + ' ms'; n = 0; worst = 0; t0 = now; }, 1000); })()`);
            e.preventDefault();
        }
    });
}

app.whenReady().then(() => {
    protocol.handle('app', (request) => {
        let rel = decodeURIComponent(new URL(request.url).pathname);
        if (rel === '/' || rel === '') rel = '/index.html';
        const file = path.normalize(path.join(GAME, rel));
        if (!file.startsWith(GAME)) return new Response('Not found', { status: 404 });   // never serve anything outside the game folder
        return net.fetch(pathToFileURL(file).toString(), { headers: request.headers });   // passes Range requests through so videos can seek
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate([
        { role: 'appMenu' },
        { label: 'View', submenu: [{ role: 'togglefullscreen' }, { role: 'reload' }, { role: 'toggleDevTools' }] },
        { role: 'windowMenu' }
    ]));
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { app.quit(); });
