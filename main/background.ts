import path from 'path'
import { app, ipcMain, ipcRenderer, Notification } from 'electron'
import { autoUpdater } from 'electron-updater'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import Store from 'electron-store';

let strapWindow, mainWindow;

const isProd = process.env.NODE_ENV === 'production'
let store;

if (isProd) {
  serve({ directory: 'app' })
  store = new Store({ name: "vatacars" });
} else {
  store = new Store({ name: "vatacars-dev" });
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

function initUpdates() {
  if (process.platform === 'win32') app.setAppUserModelId(app.name);
  if (!mainWindow) return;

  autoUpdater.autoDownload = false;

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('updateAvailable', {});
  });

  autoUpdater.on('download-progress', progressObj => {
    mainWindow.webContents.send('updateProgress', progressObj.percent.toFixed(1));
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('updateComplete', {});
  });

  autoUpdater.checkForUpdates();
}

; (async () => {
  await app.whenReady()

  strapWindow = createWindow('bootstrapper', {
    width: 460,
    height: 220,
    center: true,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await strapWindow.loadURL('app://./')
  } else {
    const port = process.argv[2]
    await strapWindow.loadURL(`http://localhost:${port}/`)
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('openApp', async (event, arg) => {
  strapWindow.close();
  mainWindow = createWindow('main', {
    width: 1024,
    height: 640,
    center: true,
    resizable: false,
    frame: false,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isProd) {
    await mainWindow.loadURL('app://./welcome')
    setTimeout(() => initUpdates(), 3000);
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/welcome`)
    //setTimeout(() => mainWindow.webContents.send('updateAvailable', {}), 2000);
    //mainWindow.webContents.openDevTools();
  }


  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require("electron").shell.openExternal(url);
    return { action: 'deny' };
  });
})

ipcMain.on('windowControl', async (event, arg) => {
  if (arg == 'minimize') return mainWindow.minimize();
  if (arg == 'maximize') return mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  if (arg == 'close') return mainWindow.close();

  if (arg == 'unrestrictSize') {
    mainWindow.setResizable(true);
    mainWindow.setMinimumSize(1024, 640);
  }
});

ipcMain.on('storeInteraction', async (event, arg) => {
  if (arg.action == 'set') {
    store.set(arg.setting, arg.property);
  } else if (arg.action == 'get') {
    event.reply('storeInteractionReply', {
      setting: arg.setting,
      property: store.get(arg.setting) || false
    });
  }
});

ipcMain.on('installUpdate', async (_event, _arg) => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('restartApp', (_event, _arg) => {
  autoUpdater.quitAndInstall();
});