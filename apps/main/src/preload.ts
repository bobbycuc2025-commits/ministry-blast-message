import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getApiUrl: () => ipcRenderer.invoke('get-api-url'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  isElectron: true
});