import fs from 'fs';
import path from 'path';
import { app, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import Store from 'electron-store';
import sudoPrompt from '@vscode/sudo-prompt';
import AdmZip from 'adm-zip';
import axios from 'axios';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipe = promisify(pipeline);

// Store initialization as in previous version
const isProd = process.env.NODE_ENV === 'production';
let store: Store;
if (isProd) {
  serve({ directory: 'app' }); // directory 'app' as in previous version
  store = new Store({ name: 'vatacars' });
} else {
  store = new Store({ name: 'vatacars-dev' });
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

let strapWindow: Electron.BrowserWindow;
let mainWindow: Electron.BrowserWindow;

// ----- Window Creation Logic -----
(async () => {
  await app.whenReady();

  strapWindow = createWindow('bootstrapper', {
    width: 1920,
    height: 1080,
    center: true,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const port = process.argv[2];
  const url = isProd ? 'app://./' : `http://localhost:${port}/`;
  await strapWindow.loadURL(url);
})();

ipcMain.on('openApp', async () => {
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

  const port = process.argv[2];
  const url = isProd ? 'app://./welcome' : `http://localhost:${port}/welcome`;
  await mainWindow.loadURL(url);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isProd) setTimeout(() => initUpdates(), 3000);
});

  // Add the CORS headers as in the previous version
  const UpsertKeyValue = (
    header: Record<string, string> | Record<string, string[]>,
    keyToChange: string,
    value: string | string[],
  ) => {
    for (const key of Object.keys(header)) {
      if (key.toLowerCase() === keyToChange.toLowerCase()) {
        header[key] = value;
        return;
      }
    }
    header[keyToChange] = value;
  };

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    const { requestHeaders } = details;
    UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', '*');
    callback({ requestHeaders });
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const { responseHeaders } = details;
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*']);
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*']);
    callback({
      responseHeaders,
    });
  });

  if (isProd) {
    await mainWindow.loadURL('app://./welcome');
    setTimeout(() => initUpdates(), 3000);
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/welcome`);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
});

// ---- Window Control Logic ----
ipcMain.on('windowControl', async (_event, arg) => {
  const win = mainWindow || require('electron').BrowserWindow.getFocusedWindow();
  if (!win) return;
  if (arg === 'minimize') win.minimize();
  if (arg === 'maximize') win.isMaximized() ? win.unmaximize() : win.maximize();
  if (arg === 'close') win.close();
  if (arg === 'unrestrictSize') {
    win.setResizable(true);
    win.setMinimumSize(1024, 640);
  }
});

// ---- Store Interaction ----
ipcMain.on('storeInteraction', (event, arg) => {
  if (arg.action === 'set') {
    store.set(arg.setting, arg.property);
  } else if (arg.action === 'get') {
    event.reply('storeInteractionReply', {
      setting: arg.setting,
      property: store.get(arg.setting) || false,
    });
  }
});

// ---- Updater Integration ----
function initUpdates() {
  if (process.platform === 'win32') app.setAppUserModelId(app.name);
  if (!mainWindow) return;

  autoUpdater.autoDownload = false;

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('updateAvailable', {});
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('updateProgress', progressObj.percent.toFixed(1));
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('updateComplete', {});
  });

  autoUpdater.checkForUpdates();
}

ipcMain.on('installUpdate', () => autoUpdater.downloadUpdate());
ipcMain.on('restartApp', () => autoUpdater.quitAndInstall());

// ---- Process Checker ----
function checkProcess(query: string, cb: (running: boolean) => void) {
  const exec = require('child_process').exec;
  let cmd = '';
  switch (process.platform) {
    case 'win32':
      cmd = 'tasklist';
      break;
    case 'darwin':
      cmd = `ps -ax | grep ${query}`;
      break;
    case 'linux':
      cmd = 'ps -A';
      break;
    default:
      break;
  }
  exec(cmd, (err, stdout) => cb(stdout.toLowerCase().includes(query.toLowerCase())));
}

// ---- Plugin Download Logic ----
async function download(url: string, dest: string, onProgress?: (bytes: number, percent: number) => void) {
  const response = await axios.get(url, {
    responseType: 'stream',
    maxRedirects: 5,
  });

  const totalLength = parseInt(response.headers['content-length'] || '0', 10);
  let downloaded = 0;

  const writer = fs.createWriteStream(dest);

  response.data.on('data', (chunk: Buffer) => {
    downloaded += chunk.length;
    if (onProgress && totalLength > 0) {
      onProgress(downloaded, Math.min((downloaded / totalLength) * 100, 100));
    }
  });

  await pipe(response.data, writer);
}

// ---- Plugin Install/Uninstall/Check Logic ----
function runProcessElevated(command: string, isCopyDir = false) {
  return new Promise<string>((resolve, reject) => {
    if (!isCopyDir) {
      return sudoPrompt.exec(command, { name: 'Install vatACARS' }, (error, stdout, stderr) => {
        if (stdout) console.log('runProcessElevated', stdout);
        if (stderr) console.log('runProcessElevated', stderr);
        if (error) return reject(error);
        return resolve(stdout?.toString?.() ?? '');
      });
    }

    const source = command.split('|')[0].trim();
    const dest = command.split('|')[1].trim();
    const scriptPath = path.join(app.getPath('userData'), '__copy_plugin.ps1');

    const scriptContent = `
      Copy-Item -Path '${source}' -Destination '${dest}' -Recurse -Force
      if ($?) { Write-Output "PLUGIN_COPY_SUCCESS" } else { exit 1 }
    `;

    fs.writeFileSync(scriptPath, scriptContent);

    const psCommand = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;

    sudoPrompt.exec(psCommand, { name: 'Install vatACARS' }, (error, stdout, stderr) => {
      if (stdout?.toString?.().includes("PLUGIN_COPY_SUCCESS")) {
        fs.unlinkSync(scriptPath);
        return resolve("PowerShell copy succeeded");
      }
      if (stderr) console.error('PowerShell stderr:', stderr?.toString?.());
      return reject(error || new Error('PowerShell copy failed'));
    });
  });
}

ipcMain.on('downloadPlugin', async (event, arg) => {
  const { pluginName, downloadUrl, version, extract } = arg;

  if (!pluginName || !downloadUrl) {
    return event.reply('downloadPluginReply', {
      pluginName,
      status: 'failed',
      error: 'Missing pluginName or downloadUrl',
    });
  }

  checkProcess('vatSys.exe', async (running) => {
    if (running) {
      return event.reply('downloadPluginReply', { pluginName, status: 'running' });
    }

    let vatSysLoc = store.get('vatSysLoc') as string | undefined;
    if (!vatSysLoc) {
      if (fs.existsSync('C:\\Program Files (x86)\\vatSys\\bin')) {
        vatSysLoc = 'C:\\Program Files (x86)\\vatSys\\bin';
      } else {
        const result = dialog.showOpenDialogSync({
          title: 'Select your vatSys.exe installation.',
          properties: ['openFile'],
          filters: [{ name: 'vatSys.exe', extensions: ['exe'] }],
        });
        if (!result) return;
        vatSysLoc = result[0].split('\\').slice(0, -1).join('\\');
      }
      store.set('vatSysLoc', vatSysLoc);
    }

    const pluginsRoot = path.join(vatSysLoc, 'Plugins');
    const pluginFolder = path.join(pluginsRoot, pluginName);
    const pluginFile = path.join(pluginsRoot, `${pluginName}.dll`);
    const pluginTarget = path.join(app.getPath('userData'), `${pluginName}.${extract ? 'zip' : 'dll'}`);

    if (!fs.existsSync(pluginsRoot)) {
      fs.mkdirSync(pluginsRoot, { recursive: true });
    }

    console.log(`📦 Downloading plugin from ${downloadUrl} to ${pluginTarget}`);
    await download(downloadUrl, pluginTarget, (bytes, percent) => {
      event.reply('downloadPluginReply', { pluginName, status: 'downloading', bytes, percent });
    });

    event.reply('downloadPluginReply', { pluginName, status: 'installing' });

    try {
      if (extract) {
        console.log("🗃 Extracting ZIP to temp...");
        const tempExtractPath = path.join(app.getPath('userData'), `${pluginName}-extract`);
        if (fs.existsSync(tempExtractPath)) fs.rmSync(tempExtractPath, { recursive: true, force: true });

        const zip = new AdmZip(pluginTarget);
        zip.extractAllTo(tempExtractPath, true);

        await runProcessElevated(`${tempExtractPath} | ${pluginFolder}`, true);
        fs.rmSync(tempExtractPath, { recursive: true, force: true });
      } else {
        const command = `copy /Y "${pluginTarget}" "${pluginFile}"`;
        await runProcessElevated(command);
      }

      store.set(`plugin_${pluginName}_version`, version);

      setTimeout(() => {
        const pluginFolderCheck = path.join(vatSysLoc!, 'Plugins', pluginName);
        const pluginFileCheck = path.join(vatSysLoc!, 'Plugins', `${pluginName}.dll`);
        const exists = fs.existsSync(pluginFolderCheck) || fs.existsSync(pluginFileCheck);

        if (exists) {
          event.reply('checkDownloadedPluginReply', { pluginName, installed: true, version });
          event.reply('downloadPluginReply', { pluginName, status: 'done' });
        } else {
          event.reply('downloadPluginReply', {
            pluginName,
            status: 'failed',
            error: 'Install completed but plugin not found.',
          });
        }
      }, 300);
    } catch (error: any) {
      console.error("❌ Plugin install error:", error);
      event.reply('downloadPluginReply', {
        pluginName,
        status: 'failed',
        error: error.message || String(error),
      });
    }
  });
});

ipcMain.on('uninstallPlugin', async (event, arg) => {
  const { pluginName } = arg;
  if (!pluginName) return;

  let vatSysLoc = store.get('vatSysLoc') as string | undefined;
  if (!vatSysLoc) {
    if (fs.existsSync('C:\\Program Files (x86)\\vatSys\\bin')) {
      vatSysLoc = 'C:\\Program Files (x86)\\vatSys\\bin';
    } else {
      const result = dialog.showOpenDialogSync({
        title: 'Select your vatSys.exe installation.',
        properties: ['openFile'],
        filters: [{ name: 'vatSys.exe', extensions: ['exe'] }],
      });
      if (!result) return;
      vatSysLoc = result[0].split('\\').slice(0, -1).join('\\');
    }
    store.set('vatSysLoc', vatSysLoc);
  }

  const pluginFolder = path.join(vatSysLoc, 'Plugins', pluginName);
  const pluginFile = path.join(vatSysLoc, 'Plugins', `${pluginName}.dll`);

  try {
    let command = '';
    if (fs.existsSync(pluginFolder)) {
      command = `rmdir /S /Q "${pluginFolder}"`;
    } else if (fs.existsSync(pluginFile)) {
      command = `del /F /Q "${pluginFile}"`;
    }

    if (command) {
      await runProcessElevated(command);
    }

    event.reply('uninstallPluginReply', { pluginName, status: 'done' });
  } catch (err) {
    console.error("❌ Failed to uninstall plugin:", err);
    event.reply('uninstallPluginReply', { pluginName, status: 'failed' });
  }
});

ipcMain.on('checkDownloadedPlugin', (event, arg) => {
  const { pluginName } = arg;
  if (!pluginName) return;

  let vatSysLoc = store.get('vatSysLoc') as string | undefined;
  if (!vatSysLoc) return event.reply('checkDownloadedPluginReply', { pluginName, installed: false });

  const pluginFolder = path.join(vatSysLoc, 'Plugins', pluginName);
  const pluginFile = path.join(vatSysLoc, 'Plugins', `${pluginName}.dll`);
  const version = store.get(`plugin_${pluginName}_version`) as string;

  const installed = fs.existsSync(pluginFolder) || fs.existsSync(pluginFile);
  event.reply('checkDownloadedPluginReply', {
    pluginName,
    installed,
    version: installed ? version : null,
  });
});

// ---- Clean Up Logic ----
function cleanUpTempFiles(pluginName: string) {
  const userData = app.getPath('userData');
  const zipFile = path.join(userData, `${pluginName}.zip`);
  const dllFile = path.join(userData, `${pluginName}.dll`);
  const extractFolder = path.join(userData, `${pluginName}-extract`);
  const psScript = path.join(userData, '__copy_plugin.ps1');

  [zipFile, dllFile, extractFolder, psScript].forEach((item) => {
    if (fs.existsSync(item)) {
      const stat = fs.statSync(item);
      if (stat.isDirectory()) {
        fs.rmSync(item, { recursive: true, force: true });
      } else {
        fs.unlinkSync(item);
      }
    }
  });
}
