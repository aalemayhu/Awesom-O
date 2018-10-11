'use strict'

const { app } = require('electron')
const fs = require('fs')
const path = require('path')
const request = require('request')

const directory = app.getPath('home') // /home folder on OS X
const cacheDirectory = `${directory}/twitch-bot-cache` // /home/twitch-bot-cache/
const cacheDataFile = `${cacheDirectory}/data.json` // /home/twitch-bot-cache/data.json

function createCacheDirectory () {
  if (fs.existsSync(cacheDirectory) === false) {
    fs.mkdirSync(cacheDirectory)
  }
}

function exampleCommands () {
  return [
    { type: 'string', name: 'what', description: 'Print out the current project', value: 'Twitch bot', enabled: true },
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
    let data = this.readAll(`${cacheDirectory}/secret.json`)
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
    let data = this.readAll(`${cacheDirectory}/data.json`)
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
    fs.writeFileSync(`${cacheDirectory}/secret.json`, JSON.stringify(data, null, 2))
  },
  save (name, value) {
    createCacheDirectory()
    let newData = this.readAll(`${cacheDirectory}/data.json`)
    newData[name] = value
    fs.writeFileSync(cacheDataFile, JSON.stringify(newData, null, 2))
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
    let imagePath = path.join(cacheDirectory, imageName)
    return fs.existsSync(imagePath)
  },
  saveImage (url) {
    let imageName = url.slice(url.lastIndexOf('/') + 1)
    let imagePath = path.join(cacheDirectory, imageName)
    request(url).pipe(fs.createWriteStream(imagePath))
    return imagePath
  }
}

module.exports = {
  fsCache
}
