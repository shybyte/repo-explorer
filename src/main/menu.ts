import {Menu, dialog} from 'electron';
import {CommandsToClient} from "../common/commands";

export function initMenu() {
  const template: any[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Select Repo',
          click(_item: any, focusedWindow: Electron.BrowserWindow) {
            let selectedFolders = dialog.showOpenDialog({properties: ['openDirectory']});
            if (selectedFolders && selectedFolders[0]) {
              focusedWindow.webContents.send(CommandsToClient.selectRepo, selectedFolders[0]);
            }
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'pasteandmatchstyle'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          role: 'reload'
        },
        {
          role: 'toggledevtools'
        },
        {
          type: 'separator'
        },
        {
          role: 'resetzoom'
        },
        {
          role: 'zoomin'
        },
        {
          role: 'zoomout'
        },
        {
          type: 'separator'
        },
        {
          role: 'togglefullscreen'
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          role: 'minimize'
        },
        {
          role: 'close'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () {
            require('electron').shell.openExternal('http://electron.atom.io');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
