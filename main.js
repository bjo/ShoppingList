const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set environment
process.env.NODE_ENV = 'production';

// Two windows, main and add
let mainWindow;
let addWindow;

// List for app to be ready
app.on('ready', function(){
  // Create new window
  mainWindow = new BrowserWindow({});
  // Load html into window
  mainWindow.loadURL(url.format({
    //file://dirname/mainWindow.html
    pathname: path.join(__dirname, 'assets/html/mainWindow.html'),
    protocol:'file:',
    slashes: true
  }));
  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Items'
  });
  // Load html into window
  addWindow.loadURL(url.format({
    //file://dirname/mainWindow.html
    pathname: path.join(__dirname, 'assets/html/addWindow.html'),
    protocol:'file:',
    slashes: true
  }));
  // Garbage collection handle
  addWindow.on('close', function(){
    addWindow = null
  });
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
	console.log(item)
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
  {
    label:'File',
    submenu:[
      {
        label: 'Add Item',
        accelerator: process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
        click(){
          createAddWindow();
        }
      },
      {
        label: 'Clear Item',
        accelerator: process.platform == 'darwin' ? 'Command+D' : 'Ctrl+D',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {  
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// if Mac, add empty object for menu formatting
if(process.platform == 'darwin'){
  // unshift adds an item to the beginning
  mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production mode
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        // causes devTools to pop up on the current window
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}