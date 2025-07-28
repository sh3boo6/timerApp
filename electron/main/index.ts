import { app, BrowserWindow, shell, ipcMain, dialog, Menu } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    width: 1130,
    height: 670,
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    //win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: 'Help',
    submenu: [
      {
        label: 'حول المؤقت',
        click: () => {
          dialog.showMessageBox({
            type: 'info',
            title: 'حول المؤقت',
            message: 'المؤقت \الإصدار 1.0.0\n\nتم الإنشاء بواسطة محمد عبدالرحمن\n\nتحت إشراف عبدالله العامري',
            buttons: ['OK'],
          });
        },
      },
      {
        label: 'Close',
        role: 'close',
        accelerator: 'CmdOrCtrl+W',
      }
    ],
  },
];
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// Removed duplicate createWindow definition to fix duplicate identifier error.

// Declare swiperWindow variable
let swiperWindow: BrowserWindow | null = null;

// Handle IPC for opening swiper window
ipcMain.on('open-swiper-window', () => {
  swiperWindow = new BrowserWindow({
    width: 300,
    height: 300,
    transparent: true,             // ✅ يسمح بالخلفية الشفافة
    frame: false,                  // ✅ نافذة بدون شريط
    resizable: false,              // ✅ لا يمكن تكبيرها
    fullscreenable: false,         // ✅ منع التكبير التلقائي
    skipTaskbar: true,             // ✅ لا تظهر في شريط المهام
    focusable: true,               // ✅ تضمن التركيز والتفاعل
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  swiperWindow.setAlwaysOnTop(true, 'screen-saver');
  swiperWindow.setVisibleOnAllWorkspaces(true); // اختياري، يعمل في macOS/Windows
  swiperWindow.focus();

// منع التكبير التلقائي
swiperWindow.on('enter-full-screen', () => {
  swiperWindow.setFullScreen(false);
});

    // ضمان عدم الاختفاء عند التفاعل
  win.once('ready-to-show', () => {
    win.show();
    win.focus();            // ✅ يجبر النافذة على التركيز
  });

  if (VITE_DEV_SERVER_URL) {
    swiperWindow.loadURL(`${VITE_DEV_SERVER_URL}#/swiper`);
  } else {
    swiperWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: '/swiper' });
  }

  swiperWindow.on('closed', () => {
    swiperWindow = null;
  });

  //swiperWindow.webContents.openDevTools();
});

ipcMain.on('close-swiper-window', () => {
  if (swiperWindow) swiperWindow.close();
});
