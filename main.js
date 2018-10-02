// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Notification} = require('electron')
var path = require('path')
const { fsCache } = require('./electron-caches.js')

let chatbot = require('./chatbot.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

/*
TODO: add flag to disable a command
TODO: Add more types (file, url, default)
*/

// "cached now" object
let caches = {}

let chatClient
let commandPrefix = '!'

let defaultCommands = {help, commands}

let knownCommands = { echo, what, when, github, gitlab, bashrc }
var commandDescriptions = {
  'echo': 'Print out everything after echo',
  'commands': 'List all of the supported commands',
  'help': 'Show description for a command',
  'what': 'Print out the current project',
  'when': 'Print stream schedule',
  'github': 'Print GitHub profile URL',
  'gitlab': 'Print GitHub profile URL',
  'bashrc': 'my bash profile',
}

function loadTestCommands() {
  var commands = [
    { type: "string", name: "echo", description: "Print out everything after echo"},
    { type: "string", name: "what",  description: "Print out the current project"},
    { type: "string", name: "when", description: "Print stream schedule"},
    { type: "string", name: "github", description: "Print GitHub profile URL"},
    { type: "string", name: "gitlab", description: "Print GitHub profile URL"},
    { type: "string", name: "bashrc", description: "my bash profile"}
  ]
  console.log('commands='+commands)
  fsCache.save('commands', commands)
}

function createWindow () {

  caches = fsCache.readAll('data')
  if (!caches["commands"] || caches["commands"].length == 0) {
    console.log('commands is empty')
    loadTestCommands()
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png')
})

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

  global.commands = caches["commands"]
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
  const n = new Notification({ title: title, body: body, silent: false});
  n.on('show', () => console.log('showed'));
  n.on('click', () => console.info('clicked!!'));
  n.show();
}

function onMessageHandler (target, context, msg, self) {
  if (self) { return } // Ignore messages from the bot

  // This isn't a command since it has no prefix:
    if (msg.substr(0, 1) !== commandPrefix) {
      console.log(`[${target} (${context['message-type']})] ${context.username}: ${msg}`)
      displayNotification('Message from @'+context.username, msg)
      return
    }

    // Split the message into individual words:
    const parse = msg.slice(1).split(' ')
    // The command name is the first (0th) one:
    const commandName = parse[0]
    // The rest (if any) are the parameters:
    const params = parse.splice(1)

    // If the command is known, let's execute it:
    if (commandName in knownCommands) {
      const command = knownCommands[commandName]
      command(target, context, params)
      console.log(`* Executed ${commandName} command for ${context.username}`)
    } else if (commandName in defaultCommands) {
      const command = defaultCommands[commandName]
      command(target, context, params)
      console.log(`* Executed ${commandName} command for ${context.username}`)
    } else {
      console.log(`* Unknown command ${commandName} from ${context.username}`)
    }
}

function configure() {
  try {
    // TODO: replace secret with a configuration instance
    let secret = require('./secret.js')

    chatClient = new chatbot({
        channel: secret.CHANNELNAMEHERE,
        username: secret.USERNAMEHERE,
        password: secret.AUTHTOKENHERE
    });

    chatClient.on('message', onMessageHandler)
    chatClient.on('connected', onConnectedHandler)
    chatClient.on('disconnected', onDisconnectedHandler)

    // Auto connect
    chatClient.connect()
  }  catch (err) {
    console.log(err)
  }
}

// Called every time the bot connects to Twitch chat:
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}

// Called every time the bot disconnects from Twitch:
function onDisconnectedHandler (reason) {
  console.log(`Disconnected: ${reason}`)
  // process.exit(1)
}

// Handle renderer messages

ipcMain.on('connect-bot', (event, arg) => {
    chatClient.connect();
})

ipcMain.on('disconnect-bot', (event, arg) => {
  chatClient.disconnect();
})


// Commands

// Function called when the "echo" command is issued:
function echo (target, context, params) {
  // If there's something to echo:
  if (params.length) {
    // Join the params into a string:
    const msg = params.join(' ')
    // Send it back to the correct place:
    sendMessage(target, context, msg)
  } else { // Nothing to echo
    console.log(`* Nothing to echo`)
  }
}

// Function called when the "commands" command is issued:
async function commands (target, context, params) {
  var msg = ""
  for (var k in commandDescriptions) {
    msg += '!'+k+' '
  }
  sendMessage(target, context, msg)
}

// Function called when the "help" command is issued:
function help (target, context, params) {
  if (params.length) {
    const msg = params.join(' ')
    for (var k in commandDescriptions) {
      if (k != msg) {
        continue;
      }
      const description = commandDescriptions[k]
      if (description) {
        sendMessage(target, context, '!'+k+'- '+description)
      }
      break;
    }
  }
}

// Function called when the "what" command is issued:
function what (target, context, params) {
  // TODO: use a configuration value for this
  let msg = 'Twitch bot'
  sendMessage(target, context, msg)
}

// Function called when the "when" command is issued:
function when (target, context, params) {
  // TODO: use a configuration value for this
  let msg = 'From 5PM to roughly 7PM (GMT+2)'
  sendMessage(target, context, msg)
}

// Function called when the "github" command is issued:
function github (target, context, params) {
  // TODO: use a configuration value for this
  let msg = 'https://github.com/scanf'
  sendMessage(target, context, msg)
}

// Function called when the "gitlab" command is issued:
function gitlab (target, context, params) {
  // TODO: use a configuration value for this
  let msg = 'https://gitlab.com/scanf'
  sendMessage(target, context, msg)
}

// Function called when the "gitlab" command is issued:
function bashrc (target, context, params) {
  // TODO: use a configuration value for this
  let msg = 'https://github.com/scanf/dotfiles/tree/master/shell'
  sendMessage(target, context, msg)
}


// Helper function to send the correct type of message:
function sendMessage (target, context, message) {
  if (context['message-type'] === 'whisper') {
    chatClient.whisper(target, message)
  } else {
    chatClient.say(target, message)
  }
}
