import { setApiBase } from './ipc_handler.js';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

let apiBase = '';

function readPortFile() {
    const portFile = path.join(os.tmpdir(), 'fastapi_port.txt');
    
    if (!fs.existsSync(portFile)) {
        throw new Error('Backend port file not found. Please start the backend server first.');
    }
    
    try {
        const port = fs.readFileSync(portFile, 'utf8').trim();
        return Number(port);
    } catch (e) {
        throw new Error('Failed to read backend port file: ' + e.message);
    }
}

async function initializeBackendConnection() {
    try {
        const port = readPortFile();
        apiBase = `http://127.0.0.1:${port}`;
        
        // Set the API base for IPC handler to use
        setApiBase(apiBase);
        
        console.log('Backend found at:', apiBase);
        return apiBase;
    } catch (error) {
        console.error('Backend connection failed:', error.message);
        
        // Show user notification
        await dialog.showMessageBox({
            type: 'error',
            title: 'Backend Not Running',
            message: 'Backend Server Required',
            detail: error.message + '\n\nPlease start the backend server manually and restart the application.',
            buttons: ['OK']
        });
        
        // Exit the application since backend is required
        app.quit();
        return null;
    }
}

async function createWindow() {
    // Initialize backend connection first
    await initializeBackendConnection();
    
    // Simple preload path - use process.cwd() which works reliably
    const preloadPath = path.join(process.cwd(), 'src', 'preload.js');

    // Create the browser window
    const win = new BrowserWindow({
        width: 1500,
        height: 1000,
        titleBarStyle: 'hidden',
        titleBarOverlay: { color: '#1f1f1f', symbolColor: '#ffffff', height: 32 },
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    await win.loadFile('src/renderer/home/home.html');
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    // Clean shutdown - backend is managed externally
    console.log('Application shutting down...');
});