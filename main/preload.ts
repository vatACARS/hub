import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Your existing ipc handler
const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value);
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args) => callback(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
};

const preloadPages = async () => {
  const pagesToPreload = [
    "/", // Landing page
    "/home",
    "/euroscope",
    "/vatsys",
    "/pilot",
    "/OzStrips",
  ];

  for (const page of pagesToPreload) {
    try {
      await fetch(page, { cache: "force-cache" });
      console.log(`[Preload] Preloaded: ${page}`);
    } catch (error) {
      console.warn(`[Preload] Failed to preload ${page}:`, error);
    }
  }
};


// Expose to the window
contextBridge.exposeInMainWorld('ipc', handler);

// Automatically preload pages
(async () => {
  console.log("[Preload] Starting automatic page preloading...");
  await preloadPages();
})();


export type IpcHandler = typeof handler;
