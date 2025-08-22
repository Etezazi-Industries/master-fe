import './ipc_handler.js'
import { app, BrowserWindow } from 'electron';
import path from 'path';


const createWindow = () => {
    const win = new BrowserWindow({
        width: 1500,
        height: 1000,
        titleBarStyle: 'hidden',
        titleBarOverlay: {                // Windows 10+ (and mac with hidden)
            color: '#1f1f1f',
            symbolColor: '#ffffff',
            height: 32
        },
        webPreferences: {
            preload: path.join(app.getAppPath(), "src", "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,  // no direct access to Node.js globals and APIs
        }
    })
    win.loadFile('src/renderer/home/home.html');
    win.webContents.openDevTools();
}


app.whenReady().then(() => {
    createWindow();
})


