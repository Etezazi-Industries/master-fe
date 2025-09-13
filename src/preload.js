// preload.js (CommonJS)
let electronModule;
try {
    // Works when not sandboxed
    electronModule = require('electron');
} catch {
    // Works in sandboxed preload
    electronModule = require('electron/renderer');
}
const { contextBridge, ipcRenderer } = electronModule;

console.log('preload loaded');

contextBridge.exposeInMainWorld('backend', {
    getApiBase: () => ipcRenderer.invoke('get-api-base'),
});

