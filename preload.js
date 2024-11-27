const { contextBridge, ipcRenderer } = require("electron");

// Expose APIs to the renderer process
contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: {
        invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
        send: (channel, ...args) => ipcRenderer.send(channel, ...args),
        on: (channel, listener) => ipcRenderer.on(channel, listener),
        once: (channel, listener) => ipcRenderer.once(channel, listener),
        removeListener: (channel, listener) =>
            ipcRenderer.removeListener(channel, listener),
    },
    app: {
        relaunch: () => ipcRenderer.send("app-relaunch"),
    },
});
