const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('api', {
    login: async (username, password) => {
        return ipcRenderer.invoke('login', username, password);
    },

    switch_to_main_window: async (win) => {
        return ipcRenderer.invoke('switch_to_main_window');
    },

    search_for_rfq: async (rfq_num) => {
        return ipcRenderer.invoke('search_for_rfq', rfq_num);
    }
})
