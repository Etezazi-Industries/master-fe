import { ipcMain, BrowserWindow, dialog } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Store the API base URL (will be set by main.js)
let apiBaseUrl = '';

// Export function to set API base from main.js
export function setApiBase(url) {
    apiBaseUrl = url;
}

// Handle getting API base URL
ipcMain.handle('get-api-base', async () => {
    if (!apiBaseUrl) {
        throw new Error('API base URL not initialized');
    }
    return apiBaseUrl;
});

// Handle file selection with full paths
ipcMain.handle('select-files', async (event, options = {}) => {
    const { filters = [], allowMultipleSelection = false, title = 'Select Files' } = options;
    
    const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        title,
        filters,
        properties: allowMultipleSelection ? ['openFile', 'multiSelections'] : ['openFile']
    });
    
    if (result.canceled) {
        return { canceled: true, filePaths: [] };
    }
    
    // Return file paths along with basic file info
    const fileInfos = result.filePaths.map(filePath => {
        const stats = fs.statSync(filePath);
        
        return {
            name: path.basename(filePath),
            path: filePath,
            size: stats.size,
            lastModified: stats.mtime.getTime()
        };
    });
    
    return { canceled: false, files: fileInfos };
});

//async function send_mail() {
//    return;
//}
//
//
//ipcMain.handle('send_mail', send_mail())

