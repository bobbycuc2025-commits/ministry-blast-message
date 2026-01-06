export interface ElectronAPI {
  invoke: (endpoint: string, method?: string, data?: any) => Promise<any>;
  selectFile: (options?: any) => Promise<any>;
  saveFile: (options?: any) => Promise<any>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>;
  fileExists: (path: string) => Promise<boolean>;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeListener: (channel: string, callback: (...args: any[]) => void) => void;
  navigate: (route: string) => Promise<{ success: boolean; error?: string }>;
  restartApp: () => Promise<{ success: boolean }>;
  quitApp: () => Promise<{ success: boolean }>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}