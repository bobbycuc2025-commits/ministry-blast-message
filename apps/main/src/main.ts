import { app, BrowserWindow, ipcMain } from 'electron';
import { fork, ChildProcess } from 'child_process';
import path from 'path';
import isDev from 'electron-is-dev';

let mainWindow: BrowserWindow | null = null;
let apiProcess: ChildProcess | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    icon: path.join(__dirname, '../../../build/icon.png')
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../ui/out/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startApiServer() {
  const apiPath = isDev
    ? path.join(__dirname, '../../api/dist/main.js')
    : path.join(process.resourcesPath, 'api/main.js');

  apiProcess = fork(apiPath, [], {
    stdio: 'pipe',
    env: {
      ...process.env,
      PORT: '3001',
      NODE_ENV: isDev ? 'development' : 'production'
    }
  });

  apiProcess.on('error', (err) => {
    console.error('API Process Error:', err);
  });

  apiProcess.on('exit', (code) => {
    console.log(`API Process exited with code ${code}`);
    apiProcess = null;
  });

  if (apiProcess.stdout) {
    apiProcess.stdout.on('data', (data) => {
      console.log(`API: ${data.toString()}`);
    });
  }

  if (apiProcess.stderr) {
    apiProcess.stderr.on('data', (data) => {
      console.error(`API Error: ${data.toString()}`);
    });
  }
}

app.on('ready', () => {
  startApiServer();
  setTimeout(createWindow, 2000); // Wait for API to start
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (apiProcess) {
    apiProcess.kill();
  }
});

// Handle IPC from renderer
ipcMain.handle('get-api-url', () => {
  return isDev ? 'http://localhost:3001' : 'http://localhost:3001';
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});