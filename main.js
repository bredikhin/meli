const fs = require('fs');
const path = require('path');
const electron = require('electron');
const Menu = require('electron').Menu;
const ipc = electron.ipcMain;
const dataPath = path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], '.meli');
const menubar = require('menubar');
const mb = menubar({
  icon: path.join(__dirname, 'icons', 'meli22.png'),
  preloadWindow: true
});

mb.on('after-create-window', () => {
  const rightClickMenu = Menu.buildFromTemplate([
    {
      label: 'Quit', click: () => {
        mb.app.quit();
      }
    }
  ]);
  mb.tray.on('right-click', () => {
    mb.tray.popUpContextMenu(rightClickMenu);
  });

  // Load text from the file on disk
  ipc.on('loadText', (event) => {
    fs.readFile(dataPath, (err, data) => {
      if (err) {
        return console.log(err);
      }

      event.sender.send('textLoaded', data);
    });
  });

  // Save text to the file on disk
  ipc.on('saveText', (event, data) => {
    fs.writeFile(dataPath, data, (err) => {
      if (err) {
        return console.log(err);
      }

      event.sender.send('textSaved');
    });
  });
});
