'use strict'

const { Menu, dialog, app, BrowserWindow, ipcMain } = require('electron')
const { fsCache } = require('./src/js/electron-caches.js')
const fs = require('fs')
const Chatbot = require('./src/js/chatbot.js')
const { Runner } = require('./src/js/commands/runner.js')

var dateFormat = require('dateformat')
var path = require('path')

let mainWindow
let clientId = 'tutlj043hnk4iyttxwj1gvoicguhta'
let chatClient
let runner

function defaultWindowState () {
  var state = { x: 0, y: 0, width: 640, height: 320 }
  if (global.config.windowState) {
    let ws = global.config.windowState
    state.x = ws.x ? ws.x : state.x
    state.y = ws.y ? ws.y : state.y
    state.width = ws.width ? ws.width : state.width
    state.height = ws.height ? ws.height : state.height
  }
  return state
}

function createWindow () {
  app.setAppUserModelId('ccscanf.twitch.awesom-o')
  loadCacheFiles()
  let state = defaultWindowState()
  mainWindow = new BrowserWindow({
    titleBarStyle: 'hidden',
    backgroundColor: '#22252A',
    show: false,
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    'minWidth': 550,
    'minHeight': 320,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png')
  })

  mainWindow.loadFile('src/pages/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.on('close', function () {
    fsCache.saveConfig({ 'config': global.config })
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

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
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

function onMessageHandler (target, context, msg, self) {
  if (self) { return } // Ignore messages from the bot
  chatClient.api({
    url: `https://api.twitch.tv/kraken/channels/${context.username}`,
    method: 'GET',
    headers: { 'Client-ID': clientId }
  }, function (err, res, body) {
    if (err) { return }
    if (!fsCache.hasImage(body.logo)) {
      global.config.avatars[context.username] = fsCache.saveImage(body.logo)
    }
  })

  runner.parse(target, context, msg, () => {
    mainWindow.webContents.send('display-notification', {
      title: `Message from @${context.username}`,
      body: msg,
      icon: global.config.avatars[context.username]
    })
  })
}

function onJoinHandler (channel, username, self) {
  console.log(`onJoinHandler(${channel}, ${username}, ${self})`)
  if (!global.config.shouldGreetUser) {
    console.log('skipping greeting user')
    return
  }
  // TODO: empty out the greetedUsers array once a day?
  if (self || username === global.config.name.replace('#', '')) { return }
  if (!global.config.greetedUsers) { global.config.greetedUsers = [] }
  let didGreetUser = global.config.greetedUsers.find(function (u) {
    if (u === username) { return u }
  })
  if (didGreetUser) { return }
  global.config.greetedUsers.push(username)
  let msg = `Welcome @${username}, see ${global.config.prefix}commands for chat commands ;-)`
  chatClient.whisper(username, msg)
}

function onHostedHandler (channel, username, viewers, autohost) {
  let msg = `${channel} is hosted by ${username} viewers=${viewers}`
  chatClient.say(channel, msg)
};

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
  global.isConnected = true
  mainWindow.webContents.send('display-notification', {
    title: 'Awesom-O connected', body: ''
  })
  mainWindow.webContents.send('view', 'commands.html')
}

function onDisconnectedHandler (reason) {
  mainWindow.webContents.send('display-notification', {
    title: 'Awesom-O disconnected', body: reason
  })
  if (global.config.autoConnect && chatClient) {
    console.log('Reconnecting attempt')
    chatClient.connect()
  }
  global.isConnected = false
  mainWindow.webContents.send('view', 'commands.html')
}

function isValid (config) {
  return config && config.name && config.bot && config.oauth
}

function loadCacheFiles () {
  global.commands = fsCache.commands()
  global.config = fsCache.config()
}

function addStandupReminder () {
  // Remind me to stand up every hour 00 via notifications
  setInterval(function () {
    if (!global.config.standupReminder) { return }
    let date = Date()
    let f = dateFormat(date, 'MM')
    if (f === '00' && isValid(global.config)) {
      mainWindow.webContents.send('display-notification', {
        title: 'Reminder', body: 'Time to standup and stretch out ;-)'
      })
    }
  }, 60000)
}

function addMenuItem () {
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'View on GitHub',
          click () { require('electron').shell.openExternal('https://github.com/scanf/awesom-o') }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })

    // Window menu
    template[3].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ]
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function configure () {
  addMenuItem()
  addStandupReminder()
  if (!isValid(global.config)) {
    mainWindow.webContents.send('view', 'configuration.html')
  } else {
    setupClient()
    if (global.config.autoconnect && chatClient) {
      chatClient.connect()
    } else {
      mainWindow.webContents.send('display-notification', {
        title: 'Error', body: 'Chat client not configured'
      })
    }
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

  runner = new Runner(chatClient, global.commands)
}

// Handle renderer messages

ipcMain.on('set-height', (event, height) => {
  console.log(`set-height(${height})`)
  mainWindow.setSize(global.config.windowState.width, height)
  mainWindow.setMinimumSize(mainWindow.getMinimumSize()[0], height)
})

ipcMain.on('connect-bot', (event, arg) => {
  if (!global.config) { setupClient() }
  if (chatClient) {
    chatClient.connect()
  } else {
    mainWindow.webContents.send('display-notification', {
      title: 'Error', body: 'Chat client not configured'
    })
  }
})

ipcMain.on('disconnect-bot', (event, arg) => {
  if (!chatClient) { return }
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
  mainWindow.webContents.send('view', 'command-detailview.html')
})

ipcMain.on('save-configuration', (event, config) => {
  let newConfig = config
  newConfig.windowState = global.config.windowState
  fsCache.saveConfig({ 'config': config })
  loadCacheFiles()

  if (chatClient) {
    chatClient.disconnect()
  }
  setupClient()
  if (chatClient) {
    chatClient.connect()
  } else {
    mainWindow.webContents.send('display-notification', {
      title: 'Error', body: 'Chat client not configured'
    })
  }
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
    fsCache.save('commands', global.commands)
    mainWindow.webContents.send('view', 'commands.html')
  })
})

ipcMain.on('import-jokes-file', (event, arg) => {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { extensions: ['txt'] }
    ]
  }, function (filePaths, bookmarks) {
    if (!filePaths) { return }
    let path = filePaths.toString()
    mainWindow.webContents.send('selected-jokes-file', path)
  })
})

ipcMain.on('delete-command', (event, cmdName) => {
  let commands = global.commands
  let index = commands.findIndex(function (e) {
    return e.name === cmdName
  })

  if (index >= 0) {
    dialog.showMessageBox({
      type: 'warning',
      title: `Deleting command ${cmdName}`,
      message: 'This action is non revertible, do you want to continue?',
      buttons: ['Delete', 'Cancel'],
      defaultId: 1,
      noLink: true
    }, function (response, checkboxChecked) {
      if (response === 0) {
        commands.splice(index, 1)
        global.commands = commands
        fsCache.save('commands', commands)
        mainWindow.webContents.send('view', 'commands.html')
      }
      console.log(`callback(${response}, ${checkboxChecked})`)
    })
  } else {
    mainWindow.webContents.send('view', 'commands.html')
  }
  global.selectedCommand = null
})
