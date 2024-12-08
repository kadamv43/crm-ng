const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true, // Required for secure IPC
            nodeIntegration: false, // Recommended to disable
        },
    });

    // Load the Angular app
    mainWindow.loadFile(path.join(__dirname, "/dist/sakai-ng/index.html"));

    // Open DevTools for debugging (disable in production)
    mainWindow.webContents.openDevTools();

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    setupAutoUpdater();
}

// Auto-Updater configuration and events
function setupAutoUpdater() {
    autoUpdater.on("checking-for-update", () => {
        sendStatusToRenderer("Checking for updates...");
    });

    autoUpdater.on("update-available", (info) => {
        sendStatusToRenderer("Update available. Downloading...");
    });

    autoUpdater.on("update-not-available", () => {
        sendStatusToRenderer("No updates available.");
    });

    autoUpdater.on("download-progress", (progressObj) => {
        mainWindow?.webContents.send("download-progress", progressObj);
    });

    autoUpdater.on("update-downloaded", () => {
        sendStatusToRenderer("Update downloaded. Ready to install.");
    });

    autoUpdater.on("error", (err) => {
        sendStatusToRenderer(`Error: ${err.message}`);
    });
}

// Send messages to Angular app
function sendStatusToRenderer(message) {
    mainWindow?.webContents.send("update-status", message);
}

// IPC Handlers
ipcMain.on("check-for-updates", () => {
    autoUpdater.checkForUpdates();
});

ipcMain.on("install-update", () => {
    autoUpdater.quitAndInstall();
});

// App Lifecycle
app.on("ready", createMainWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (!mainWindow) {
        createMainWindow();
    }
});
