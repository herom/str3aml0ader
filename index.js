const {app, BrowserWindow ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const Loader = require('./lib/loader');
const InterComm = require('./lib/intercomm');
const logger = require('./lib/log/logger');
const loaderInstance = new Loader(app.getPath('music'), logger);
const interCommInstance = new InterComm(ipcMain, new Loader(app.getPath('music', logger)), logger);
// Keep, as it will be garbage-collected otherwise!
let win = null;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false
  });

  win.loadURL(url.format({
        pathname: path.join(__dirname, 'app', 'index.html'),
        protocol: 'file',
        slashes: true
      }));

  // TODO remove in production
  win.webContents.openDevTools();

  win.on('close', () => {
    win = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('In ACTIVATE hook!');

  if (win === null) {
    createWindow();
  }
});


