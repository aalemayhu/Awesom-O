'use strict'

const fs = require('fs')

let builtinCommands = { echo, help, commands, joke }

// Function called when the "help" command is issued:
function help (target, context, params, sendMessage) {
  if (params.length) {
    const msg = params.join(' ')
    let c = global.commands
    for (var k in c) {
      let cmd = c[k]
      if (cmd.name !== msg) {
        continue
      }
      sendMessage(target, context, `'${global.config.prefix}${cmd.name} - ${cmd.description}`)
      break
    }
  } else {
    sendMessage(target, context, `USAGE: ${global.config.prefix}help cmd (without ${global.config.prefix})`)
  }
}

// Helper function for getting random number
function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  let date = new Date()
  let seed = date.getMonth() + date.getFullYear() + date.getMinutes() + date.getMilliseconds() + date.getSeconds()
  return Math.floor(Math.random(seed) * (max - min)) + min
}

// Function called when the "joke" command is issued:
function joke (target, context, params, sendMessage) {
  if (!global.config.jokesFilePath) {
    sendMessage(target, context, 'Sorry, jokes not configured yet.')
    return
  }
  let msg = fs.readFileSync(global.config.jokesFilePath, 'utf-8')
  let jokes = msg.split('\n')
  let index = getRandomInt(0, jokes.length - 1)
  sendMessage(target, context, jokes[index])
}

// Function called when the "commands" command is issued:
function commands (target, context, params, sendMessage) {
  var msg = ''
  let c = global.commands
  for (var k in c) {
    let cmd = c[k]
    if (cmd.enabled) {
      msg += `${global.config.prefix}${cmd.name} `
    }
  }
  sendMessage(target, context, msg)
}

// Function called when the "echo" command is issued:
function echo (target, context, params, sendMessage) {
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

module.exports = {
  help,
  builtinCommands
}
