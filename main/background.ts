import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

let strapWindow, mainWindow;

;(async () => {
  await app.whenReady()

  strapWindow = createWindow('bootstrapper', {
    width: 460,
    height: 220,
    frame: false,
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
    height: 720,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
  }
})

ipcMain.on('windowControl', async (event, arg) => {
  if(arg == 'minimize') return mainWindow.minimize();
  if(arg == 'maximize') return mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  if(arg == 'close') return mainWindow.close();
});