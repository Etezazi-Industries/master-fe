import './ipc_handler.js';
import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

let backendProc = null;
let apiBase = '';

function getBackendDir() {
    // PROD: inside app resources
    if (app.isPackaged) return path.join(process.resourcesPath, 'backend');
    // DEV: adjust this to where your EXE is built
    // Example assumes: repo/python_backend/dist/fastapi-backend.exe
    return path.resolve(process.cwd(), 'backend_dist'); // <-- change if needed
}

function getBackendExe() {
    return path.join(getBackendDir(), 'fastapi-backend.exe');
}

function waitForPortFile(timeoutMs = 15000) {
    const portFile = path.join(os.tmpdir(), 'fastapi_port.txt');
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const t = setInterval(() => {
            if (fs.existsSync(portFile)) {
                try {
                    const port = fs.readFileSync(portFile, 'utf8').trim();
                    clearInterval(t);
                    resolve(Number(port));
                } catch (e) {
                    clearInterval(t);
                    reject(e);
                }
            } else if (Date.now() - start > timeoutMs) {
                clearInterval(t);
                reject(new Error('Backend failed to start (timeout while waiting for port file).'));
            }
        }, 150);
    });
}

async function startBackend() {
    // Always kill any existing backend first
    if (backendProc && !backendProc.killed) {
        backendProc.kill('SIGKILL');
        backendProc = null;
    }

    const exe = getBackendExe();
    if (!fs.existsSync(exe)) {
        throw new Error(`Backend EXE not found at: ${exe}`);
    }

    backendProc = spawn(exe, [], {
        cwd: getBackendDir(),
        detached: false,
        stdio: 'ignore', // change to ['ignore','pipe','pipe'] if you want logs
    });

    backendProc.on('exit', (code) => {
        // If it dies early, you'll know
        if (!app.isQuiting) console.error(`Backend exited with code ${code}`);
        backendProc = null; // Reset when process exits
    });

    const port = await waitForPortFile();
    apiBase = `http://127.0.0.1:${port}`;
    console.log(apiBase);
    return apiBase;
}

function stopBackend() {
    if (backendProc && !backendProc.killed) {
        try {
            backendProc.kill('SIGTERM');
            // Force kill if SIGTERM doesn't work within 3 seconds
            setTimeout(() => {
                if (backendProc && !backendProc.killed) {
                    try { backendProc.kill('SIGKILL'); } catch { }
                }
            }, 3000);
        } catch { }
    }
    backendProc = null;

    // Clean up the port file
    const portFile = path.join(os.tmpdir(), 'fastapi_port.txt');
    try {
        if (fs.existsSync(portFile)) {
            fs.unlinkSync(portFile);
        }
    } catch (e) {
        console.error('Failed to delete port file:', e);
    }
}

async function createWindow() {
    // 1) Make sure backend is up before window loads
    // const base = await startBackend();

    // ipcMain.handle('get-api-base', () => apiBase);

    // 2) Create the browser window
    const win = new BrowserWindow({
        width: 1500,
        height: 1000,
        titleBarStyle: 'hidden',
        titleBarOverlay: { color: '#1f1f1f', symbolColor: '#ffffff', height: 32 },
        webPreferences: {
            preload: path.join(app.getAppPath(), 'src', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            //additionalArguments: [`--apiBase=${base}`], // <— pass backend URL to preload
        },
    });

    await win.loadFile('src/renderer/home/home.html');
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    stopBackend();
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    // mark that we’re quitting to ignore “unexpected” backend exit logs
    app.isQuiting = true;
    stopBackend();
});

