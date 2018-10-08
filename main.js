'use strict'

const { dialog, app, BrowserWindow, ipcMain, Notification } = require('electron')
const { fsCache } = require('./src/js/electron-caches.js')
const fs = require('fs')
const { randomJoke } = require('./src/js/joker.js')
const Chatbot = require('./src/js/chatbot.js')

var dateFormat = require('dateformat')
var path = require('path')

let mainWindow

let chatClient
let commandPrefix = '!'
let builtinCommands = { echo, help, commands, joke }

function useExampleCommands () {
  var commands = [
    { type: 'string', name: 'what', description: 'Print out the current project', value: 'Twitch bot', enabled: true },
    { type: 'string', name: 'when', description: 'Print stream schedule', value: 'From 5PM to roughly 7PM (GMT+2)', enabled: true },
    { type: 'string', name: 'github', description: 'Print GitHub profile URL', value: 'https://github.com/scanf', enabled: true },
    { type: 'string', name: 'gitlab', description: 'Print GitHub profile URL', value: 'https://gitlab.com/scanf', enabled: true },
    { type: 'string', name: 'bashrc', description: 'my bash profile', value: 'https://github.com/scanf/dotfiles/tree/master/shell', enabled: true },
    { type: 'string', name: 'twitter', description: 'Link to my Twitter', value: 'https://twitter.com/ccscanf', enabled: true },
    { type: 'file', name: 'music', description: 'Currently playing music', value: '/var/folders/2d/2xkdk5xd64z4s_l27tcyrwdc0000gp/T/com.alemayhu.-000/file-for-obs.txt', enabled: true },
    { type: 'string', name: 'donate', description: 'Link to my donation page', value: 'https://streamlabs.com/ccscanf', enabled: true },
    { type: 'builtin', name: 'echo', description: 'Print out everything after echo', enabled: true },
    { type: 'builtin', name: 'commands', description: 'List all of the supported commands', enabled: true },
    { type: 'builtin', name: 'help', description: 'Show description for a command', enabled: true },
    { type: 'builtin', name: 'joke', description: 'Get a random joke ;-)', enabled: true }
  ]
  fsCache.save('commands', commands)
}

function defaultWindowState () {
  var state = { x: 0, y: 0, width: 640, height: 320 }
  if (global.config && global.config.windowState) {
    let ws = global.config.windowState
    state.x = ws.x ? ws.x : state.x
    state.y = ws.y ? ws.y : state.y
    state.width = ws.width ? ws.width : state.width
    state.height = ws.height ? ws.height : state.height
  }
  return state
}

function createWindow () {
  loadCacheFiles()
  let state = defaultWindowState()
  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png')
  })

  mainWindow.loadFile('src/pages/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.on('close', function () {
    fsCache.saveSecret({ 'config': global.config })
  })

  mainWindow.on('move', () => {
    let pos = mainWindow.getPosition()
    global.config.windowState.x = pos[0]
    global.config.windowState.y = pos[1]
  })

  mainWindow.on('resize', () => {
    let size = mainWindow.getSize()
    global.config.windowState.width = size[0]
    global.config.windowState.height = size[1]
  })

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

function displayNotification (title, body) {
  let isSilent = global.config && global.config.silent ? global.config.silent : true
  const n = new Notification({ title: title, body: body, silent: isSilent })
  n.on('show', () => console.log('showed'))
  n.on('click', () => console.info('clicked!!'))
  n.show()
}

function onMessageHandler (target, context, msg, self) {
  if (self) { return } // Ignore messages from the bot

  // This isn't a command since it has no prefix:
  if (msg.substr(0, 1) !== commandPrefix && context.username !== global.config.name.replace('#', '')) {
    console.log(`[${target} (${context['message-type']})] ${context.username}: ${msg}`)
    displayNotification(`Message from @${context.username} ${msg}`)
    return
  }

  // Split the message into individual words:
  const parse = msg.slice(1).split(' ')
  // The command name is the first (0th) one:
  const commandName = parse[0].toLowerCase()
  // The rest (if any) are the parameters:
  const params = parse.splice(1)

  let cmd = global.commands.find(function (e) {
    if (e.name.toLowerCase() === commandName) {
      return e
    }
  })

  if (!cmd) {
    console.log(`* Unknown command ${commandName} from ${context.username}`)
    return
  }

  if (cmd.enabled === false) {
    chatClient.say(target, `!${commandName} is disabled`)
    return
  }

  // Handle the builtin commands
  if (commandName in builtinCommands) {
    const commandHandler = builtinCommands[commandName]
    if (commandHandler) {
      commandHandler(target, context, params)
    }
  } else {
    // Handle the user defined commands
    if (cmd && cmd.type === 'string') {
      sendMessage(target, context, cmd.value)
    } else if (cmd && cmd.type === 'file') {
      let msg = fs.readFileSync(cmd.value, 'utf-8')
      chatClient.say(target, msg)
    }
  }
  console.log(`* Executed ${commandName} command for ${context.username}`)
}

function onJoinHandler (channel, username, self) {
  console.log(`onJoinHandler(${channel}, ${username}, ${self})`)
  if (self || username === global.config.name.replace('#', '')) { return }
  if (!global.config.greetedUsers) { global.config.greetedUsers = [] }
  let didGreetUser = global.config.greetedUsers.find(function (u) {
    if (u === username) { return u }
  })
  if (didGreetUser) { return }
  global.config.greetedUsers.push(username)
  let msg = `Welcome @${username}, see !commands for chat commands ;-)`
  chatClient.whisper(channel, msg)
}

function onHostedHandler (channel, username, viewers, autohost) {
  let msg = `${channel} is hosted by ${username} viewers=${viewers}`
  chatClient.say(channel, msg)
};

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
  global.isConnected = true
  mainWindow.webContents.send('view', 'commands.html')
}

function onDisconnectedHandler (reason) {
  displayNotification('Awesom-O disconnected', reason)
  if (global.config.autoConnect) {
    console.log('Reconnecting attempt')
    chatClient.connect()
  }
  global.isConnected = false
  mainWindow.webContents.send('view', 'commands.html')
}

// ---

function isValid (config) {
  return config && config.name && config.bot && config.oauth
}

function loadCacheFiles () {
  global.commands = fsCache.load().commands
  if (!global.commands || global.commands.length === 0) {
    useExampleCommands()
    global.commands = fsCache.load().commands
  }
  global.config = fsCache.secrets()['config']
  if (global.config && !global.config.windowState) {
    global.config.windowState = {}
  }
}

function addStandupReminder () {
  // Remind me to stand up every hour 00 via notifications
  setInterval(function () {
    if (!global.config.standupReminder) { return }
    let date = Date()
    let f = dateFormat(date, 'MM')
    if (f === '00' && isValid(global.config)) {
      displayNotification('Reminder', 'Time to standup and stretch out ;-)')
    }
  }, 60000)
}

function configure () {
  addStandupReminder()
  if (!isValid(global.config)) {
    mainWindow.webContents.send('view', 'configuration.html')
  } else {
    setupClient()
  }
}

function setupClient () {
  chatClient = new Chatbot({
    channel: global.config.name,
    username: global.config.bot,
    password: global.config.oauth
  })

  chatClient.on('message', onMessageHandler)
  chatClient.on('connected', onConnectedHandler)
  chatClient.on('disconnected', onDisconnectedHandler)
  chatClient.on('join', onJoinHandler)
  chatClient.on('hosted', onHostedHandler)

  if (global.config.autoconnect) {
    chatClient.connect()
  }
}

// Handle renderer messages

ipcMain.on('connect-bot', (event, arg) => {
  chatClient.connect()
})

ipcMain.on('disconnect-bot', (event, arg) => {
  chatClient.disconnect()
})

ipcMain.on('save-command', (event, cmd) => {
  let commands = global.commands
  let existingCmd = commands.find(function (e) {
    if (e.name === cmd.name) {
      return e
    }
  })
  if (existingCmd) {
    if (existingCmd.type !== 'builtin') {
      existingCmd.name = cmd.name
      existingCmd.type = cmd.type
      existingCmd.description = cmd.description
      existingCmd.value = cmd.value
    }
    existingCmd.enabled = cmd.enabled
  } else {
    commands.push(cmd)
  }
  global.commands = commands
  fsCache.save('commands', commands)
  global.selectedCommand = null
  mainWindow.webContents.send('view', 'commands.html')
})

ipcMain.on('selected-command', (event, cmd) => {
  global.selectedCommand = cmd
  mainWindow.webContents.send('view', 'new-command.html')
})

ipcMain.on('save-configuration', (event, config) => {
  let newConfig = config
  newConfig.windowState = global.config.windowState
  fsCache.saveSecret({ 'config': config })
  loadCacheFiles()
  setupClient()
  mainWindow.webContents.send('view', 'commands.html')
})

ipcMain.on('export-command', (event, arg) => {
  let defaultPath = '~/Downloads/data.json'
  dialog.showSaveDialog({
    title: 'Save commands',
    defaultPath: defaultPath,
    filters: [
      { name: 'data', extensions: ['json'] }
    ]
  }, function (filePaths, bookmarks) {
    if (!filePaths) { return }
    fs.writeFileSync(filePaths, JSON.stringify({ 'commands': global.commands }, null, 2))
  })
})

ipcMain.on('import-command', (event, arg) => {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { extensions: ['json'] }
    ]
  }, function (filePaths, bookmarks) {
    if (!filePaths) {
      return
    }
    let path = filePaths.toString()
    global.commands = fsCache.readAll(path).commands
    fsCache.saveAll({ 'commands': global.commands })
    mainWindow.webContents.send('view', 'commands.html')
  })
})

ipcMain.on('delete-command', (event, cmdName) => {
  let commands = global.commands
  let index = commands.findIndex(function (e) {
    return e.name === cmdName
  })
  if (index) {
    commands.splice(index, 1)
    global.commands = commands
    fsCache.save('commands', commands)
    global.selectedCommand = null
  }
  mainWindow.webContents.send('view', 'commands.html')
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

// Function called when the "joke" command is issued:
function joke (target, context, params) {
  randomJoke(function (joke) {
    sendMessage(target, context, joke)
  })
}

// Function called when the "commands" command is issued:
function commands (target, context, params) {
  var msg = ''
  let c = global.commands
  for (var k in c) {
    let cmd = c[k]
    if (cmd.enabled) {
      msg += `!${cmd.name} `
    }
  }
  sendMessage(target, context, msg)
}

// Function called when the "help" command is issued:
function help (target, context, params) {
  if (params.length) {
    const msg = params.join(' ')
    let c = global.commands
    for (var k in c) {
      let cmd = c[k]
      if (cmd.name !== msg) {
        continue
      }
      sendMessage(target, context, `'!${cmd.name} - ${cmd.description}`)
      break
    }
  } else {
    sendMessage(target, context, 'USAGE: !help cmd (without !)')
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
