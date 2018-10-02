const {app, BrowserWindow, ipcMain, Notification} = require('electron')
var path = require('path')
const { fsCache } = require('./electron-caches.js')

let chatbot = require('./chatbot.js')

let mainWindow

/*
TODO: add flag to disable a command
TODO: Add more types (file, url, default)
*/

let caches = {}
let chatClient
let commandPrefix = '!'
let builtinCommands = {echo, help, commands}

function loadTestCommands() {
  var commands = [
    { type: "string", name: "what",  description: "Print out the current project", value: "Twitch bot"},
    { type: "string", name: "when", description: "Print stream schedule", value: "From 5PM to roughly 7PM (GMT+2)"},
    { type: "string", name: "github", description: "Print GitHub profile URL", value: "https://github.com/scanf"},
    { type: "string", name: "gitlab", description: "Print GitHub profile URL", value: "https://gitlab.com/scanf"},
    { type: "string", name: "bashrc", description: "my bash profile", value: "https://github.com/scanf/dotfiles/tree/master/shell"},
    { type: "builtin", name: "echo", description: "Print out everything after echo"},
    { type: "builtin", name: "commands", description: "List all of the supported commands"},
    { type: "builtin", name: "help", description: "Show description for a command"},
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

  mainWindow = new BrowserWindow({width: 800, height: 600,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png')
  })

  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    chatClient.close()
    mainWindow = null
  })

  global.commands = caches["commands"]
  configure()
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

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


    if (commandName in builtinCommands) {
      const command = builtinCommands[commandName]
      if (caches)
      command(target, context, params)
      console.log(`* Executed ${commandName} command for ${context.username}`)
    } else {
      let userCommands = caches["commands"]
      console.log(userCommands)
      let cmd = userCommands.find(function(e){
        return e.name == commandName
      })
      if (cmd && cmd.type == "string") {
        sendMessage(target, context, cmd.value)
      } else {
        console.log(`* Unknown command ${commandName} from ${context.username}`)
      }
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

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}

function onDisconnectedHandler (reason) {
  console.log(`Disconnected: ${reason}`)
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
  console.log('echo(...)')
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
function commands (target, context, params) {
  console.log('commands(...)')
  let c = caches["commands"]
  var msg = ""
  for (var k in c) {
    msg += '!'+c[k].name+' '
  }
  sendMessage(target, context, msg)
}

// Function called when the "help" command is issued:
function help (target, context, params) {
  console.log('help(...)')
  if (params.length) {
    const msg = params.join(' ')
    let c = caches["commands"]
    for (var k in c) {
      let cmd = c[k]
      if (cmd.name != msg) {
        continue;
      }
      sendMessage(target, context, '!'+cmd.name+'- '+cmd.description)
      break;
    }
  }
}

// Helper function to send the correct type of message:
function sendMessage (target, context, message) {
  if (context['message-type'] === 'whisper') {
    chatClient.whisper(target, message)
  } else {
    chatClient.say(target, message)
  }
}
