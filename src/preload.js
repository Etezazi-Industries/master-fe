const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('api', {
    login: async (username, password) => {
        return ipcRenderer.invoke('login', username, password);
    },

    // TODO: These should be direct API calls and not through the renderer.
    search_for_rfq: async (rfq_num) => {
        return ipcRenderer.invoke('search_for_rfq', rfq_num);
    },

    get_rfq_details: async (rfq_num) => {
        return ipcRenderer.invoke('get_rfq_details', rfq_num);
    },

    get_commodity_codes: async () => {
        return ipcRenderer.invoke('get_commodity_codes');
    }
})
