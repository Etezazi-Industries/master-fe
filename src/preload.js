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

try {
    // Test API first
    contextBridge.exposeInMainWorld('testAPI', {
        test: () => 'working'
    });

    contextBridge.exposeInMainWorld('backend', {
        getApiBase: () => ipcRenderer.invoke('get-api-base'),
    });

    contextBridge.exposeInMainWorld('electronAPI', {
        selectFiles: (options) => ipcRenderer.invoke('select-files', options),
    });
    
    // Also expose to window directly as a fallback
    window.electronAPIFallback = {
        selectFiles: (options) => ipcRenderer.invoke('select-files', options),
    };
    
} catch (error) {
    console.error('Error exposing APIs:', error);
}

