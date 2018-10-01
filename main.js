// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Notification} = require('electron')

let chatbot = require('./chatbot.js')
// TODO: replace secret with a configuration instance
let secret = require('./secret.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let chatClient

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    chatClient.close()
    mainWindow = null
  })

  configure()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function displayNotification(title, body) {
  const n = new Notification({ title: title, body: body, silent: true});
  n.on('show', () => console.log('showed'));
  n.on('click', () => console.info('clicked!!'));
  n.show();
}

function onMessage(payload) {
  if(payload.command === "PRIVMSG") {
    // if (parsed.username === secret.USERNAMEHERE) {
    //   return
    // }
    displayNotification('Message from @'+payload.username, payload.message, onReply)
  } else if(payload.command === "PING") {
      // this.webSocket.send("PONG :" + parsed.message);
      console.log('TODO: reply');
  }
}

function configure() {

  chatClient = new chatbot({
      channel: secret.CHANNELNAMEHERE,
      username: secret.USERNAMEHERE,
      password: secret.AUTHTOKENHERE,
      messageHandler: onMessage
  });
}

// Handle renderer messages

ipcMain.on('connect-bot', (event, arg) => {
    chatClient.open();
})

ipcMain.on('disconnect-bot', (event, arg) => {
  chatClient.close();
})
