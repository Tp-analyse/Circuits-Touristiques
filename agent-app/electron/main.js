import { app, BrowserWindow, Menu } from 'electron';

app.whenReady().then(() => {
    Menu.setApplicationMenu(null);

    const fenetre = new BrowserWindow({
        width: 1200,
        height: 850,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    fenetre.loadURL('http://localhost:8080');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});