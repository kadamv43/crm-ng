const { contextBridge, ipcRenderer } = require("electron");

// Expose APIs to the renderer process
contextBridge.exposeInMainWorld("electron", {
    checkForUpdates: () => ipcRenderer.send("check-for-updates"),
    installUpdate: () => ipcRenderer.send("install-update"),
    getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
    onUpdateStatus: (callback) =>
        ipcRenderer.on("update-status", (event, message) => callback(message)),
    onDownloadProgress: (callback) =>
        ipcRenderer.on("download-progress", (event, progress) =>
            callback(progress)
        ),
    printUrl: (url) => ipcRenderer.send("print-url", url),
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
