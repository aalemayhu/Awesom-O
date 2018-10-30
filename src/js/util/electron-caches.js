'use strict'

const { app } = require('electron')
const fs = require('fs')
const path = require('path')
const request = require('request')

const HOME_DIRECTORY = app.getPath('home')
const CACHE_DIRECTORY = path.join(HOME_DIRECTORY, 'twitch-bot-cache')
const CACHE_DATA_FILE = path.join(CACHE_DIRECTORY, 'data.json')
const AVATAR_DIRECTORY = path.join(CACHE_DIRECTORY, 'avatars')
const LOG_DIRECTORY = path.join(CACHE_DIRECTORY, 'logs')

function createCacheDirectory () {
  const expectedDirectories = [CACHE_DIRECTORY, AVATAR_DIRECTORY, LOG_DIRECTORY]
  expectedDirectories.forEach(d => {
    if (fs.existsSync(d) === false) {
      fs.mkdirSync(d)
    }
  })
}

function exampleCommands () {
  return [
    { type: 'string', name: 'what', description: 'Print out the current project', value: '[S]uper [N]ot [A]wesome [K]nockout [E]agle - SNAKE https://github.com/scanf/snake', enabled: true },
    { type: 'string', name: 'when', description: 'Print stream schedule', value: 'From 5PM to roughly 7PM (GMT+2)', enabled: true },
    { type: 'string', name: 'github', description: 'Print GitHub profile URL', value: 'https://github.com/scanf', enabled: true },
    { type: 'string', name: 'gitlab', description: 'Print GitHub profile URL', value: 'https://gitlab.com/scanf', enabled: true },
    { type: 'string', name: 'bashrc', description: 'my bash profile', value: 'https://github.com/scanf/dotfiles/tree/master/shell', enabled: true },
    { type: 'string', name: 'twitter', description: 'Link to my Twitter', value: 'https://twitter.com/ccscanf', enabled: true },
    { type: 'string', name: 'youtube', description: 'Print out YouTube link', value: 'https://www.youtube.com/channel/UCumJa0eRO9_xtEsoAt3UCkQ', enabled: true },
    { type: 'string', name: 'discord', description: 'Print out Discord link', value: 'https://discord.gg/fdRU6vm', enabled: true },
    { type: 'file', name: 'music', description: 'Currently playing music', value: '/var/folders/2d/2xkdk5xd64z4s_l27tcyrwdc0000gp/T/com.alemayhu.-000/file-for-obs.txt', enabled: true },
    { type: 'string', name: 'donate', description: 'Link to my donation page', value: 'https://streamlabs.com/ccscanf', enabled: true },
    { type: 'builtin', name: 'echo', description: 'Print out everything after echo', enabled: true },
    { type: 'builtin', name: 'commands', description: 'List all of the supported commands', enabled: true },
    { type: 'builtin', name: 'help', description: 'Show description for a command', enabled: true },
    { type: 'builtin', name: 'joke', description: 'Get a random joke ;-)', enabled: false }
  ]
}

const fsCache = {
  config () {
    let data = this.readAll(`${CACHE_DIRECTORY}/secret.json`)
    var config = {}

    if (data && data.config) {
      config = data.config
    }
    // Initialize the window state for later use in comparisons
    if (config.windowState === undefined) {
      config.windowState = { x: 0, y: 0, width: 640, height: 320 }
    }
    // Add a default command prefix
    if (config.prefix === undefined) {
      config.prefix = '!'
    }
    // Default value for the silent notifications
    if (config.silent === undefined) {
      config.silent = true
    }
    // Default value for the standupReminder notifications
    if (config.standupReminder === undefined) {
      config.standupReminder = false
    }
    // Default value for the autoconnect boolean
    if (config.autoconnect === undefined) {
      config.autoconnect = false
    }
    // Default value for whispering welcome message
    if (config.shouldGreetUser === undefined) {
      config.shouldGreetUser = false
    }
    // Default value for avatars
    if (config.avatars === undefined) {
      config.avatars = {}
    }

    return config
  },
  commands () {
    let data = this.readAll(`${CACHE_DIRECTORY}/data.json`)
    var commands = []
    if (data && data.commands !== undefined) {
      commands = data.commands
    }
    // Setup default ones if no command
    if (commands.length === 0) {
      commands = exampleCommands()
      fsCache.save('commands', commands)
    }
    return commands
  },
  saveConfig (data) {
    createCacheDirectory()
    fs.writeFileSync(`${CACHE_DIRECTORY}/secret.json`, JSON.stringify(data, null, 2))
  },
  save (name, value) {
    createCacheDirectory()
    let newData = this.readAll(`${CACHE_DIRECTORY}/data.json`)
    newData[name] = value
    fs.writeFileSync(CACHE_DATA_FILE, JSON.stringify(newData, null, 2))
  },
  readAll (file) {
    let data = {}

    createCacheDirectory()
    try {
      const cacheContent = fs.readFileSync(file, 'utf-8')

      try {
        const _data = JSON.parse(cacheContent)
        data = _data
      } catch (e) {
        data = {}
      }
    } catch (err) {
      console.log('Error in Cache:', err)
    }
    return data
  },
  hasImage (url) {
    let imageName = url.slice(url.lastIndexOf('/') + 1)
    let imagePath = path.join(AVATAR_DIRECTORY, imageName)
    return fs.existsSync(imagePath)
  },
  saveImage (url) {
    let imageName = url.slice(url.lastIndexOf('/') + 1)
    let imagePath = path.join(AVATAR_DIRECTORY, imageName)
    request(url).pipe(fs.createWriteStream(imagePath))
    return imagePath
  }
}

module.exports = {
  fsCache,
  LOG_DIRECTORY
}
