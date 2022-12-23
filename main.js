// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, dialog, ipcMain} = require("electron");
const path = require("path");
const {PythonShell} = require('python-shell');
const isMac = process.platform === "darwin";


//ipcMain.handle('getPath', () => app.getPath('userData'));
ipcMain.handle('getPath', async () => {
  const result = app.getPath('userData')
  return result
})

function updateHash40()
{
  //var spinner = document.getElementsByClassName("loader");
  let options = 
  {
    mode: 'text',
    scriptPath : path.join(__dirname, './engine/'),
    args: [app.getPath("userData")]
  };
  console.log("updating Hash40 list");
  console.log("accessing: ", options.args);
  let pyshell = new PythonShell('update_hash.py', options);

  pyshell.on('message', function(message) {
    console.log("output: \n", message);
    dialog.showErrorBox('Hash40 List Updated', 'Restart application to apply changes') 
  })
}

function createWindow() {
 // Create the browser window.
 const mainWindow = new BrowserWindow({
  width: 800,
  height: 600,
  webPreferences: {
   preload: path.join(__dirname, "preload.js"),
   nodeIntegration: true,
   contextIsolation: false,
   enableRemoteModule: true,
  },
 });
 //MenuBar
 const template = [
  // { role: 'appMenu' }
  ...(isMac
   ? [
      {
       label: app.name,
       submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
       ],
      },
     ]
   : []),
  // { role: 'fileMenu' }
  {
   label: "File",
   submenu: [isMac ? { role: "close" } : { role: "quit" }],
  },
  // { role: 'editMenu' }
  {
   label: "Edit",
   submenu: [
    { role: "undo" },
    { role: "redo" },
    { type: "separator" },
    { role: "cut" },
    { role: "copy" },
    { role: "paste" },
    ...(isMac
     ? [
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" },
        { type: "separator" },
        {
         label: "Speech",
         submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
        },
       ]
     : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
   ],
  },
  // { role: 'viewMenu' }
  {
   label: "View",
   submenu: [
    { role: "reload" },
    { role: "forceReload" },
    { role: "toggleDevTools" },
    { type: "separator" },
    { role: "resetZoom" },
    { role: "zoomIn" },
    { role: "zoomOut" },
    { type: "separator" },
    { role: "togglefullscreen" },
   ],
  },
  // { role: 'windowMenu' }
  {
   label: "Window",
   submenu: [
    { role: "minimize" },
    { role: "zoom" },
    ...(isMac
     ? [
        { type: "separator" },
        { role: "front" },
        { type: "separator" },
        { role: "window" },
       ]
     : [{ role: "close" }]),
   ],
  },
  {
   role: "help",
   submenu: [
    {
     label: "Learn More",
     click: async () => {
      const { shell } = require("electron");
      await shell.openExternal("https://electronjs.org");
     },
    },
   ],
  },
  {
   label: "Hash40",
   submenu: [
    {
     label: "Update Hash list",
     click: async () => {
      updateHash40();
     },
    },
   ],
  },
 ];

 // and load the index.html of the app.
 mainWindow.loadFile("./gui/homepage/Homepage.html");
 const menu = Menu.buildFromTemplate(template);
 Menu.setApplicationMenu(menu);
 // Open the DevTools.
 // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
 createWindow();

 app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
 });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
 if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
