'use strict'

const { isString, isAlias, isFile } = require('./types.js')
const { builtinCommands } = require('./builtin_handlers')
const fs = require('fs')

class Runner {
  constructor (chatClient, userCommands) {
    this.chatClient = chatClient
    this.userCommands = userCommands
  }

  parse (target, context, msg, onNotification) {
    if (msg.substr(0, 1) !== global.config.prefix &&
    context.username !== global.config.name.replace('#', '')) {
      // This isn't a command since it has no prefix:
      console.log(`[${target} (${context['message-type']})] ${context.username}: ${msg}`)
      onNotification()
    } else if (msg.substr(0, 1) === global.config.prefix) {
      this.run(target, context, msg)
    }
  }

  run (target, context, msg) {
    const parse = msg.slice(1).split(' ')
    const commandName = parse[0].toLowerCase()
    const params = parse.splice(1)
    let cmd = global.commands.find(e => {
      if (e.name.toLowerCase() === commandName) {
        return e
      }
    })

    if (!cmd) {
      console.log(`* Unknown command ${commandName} from ${context.username}`)
    } else if (cmd.enabled === false) {
      this.chatClient.say(target, `${global.config.prefix}${commandName} is disabled`)
    } else {
      if (isAlias(cmd)) {
        this.handle(cmd, target, context, params)
      } else {
        this.handleAliasCommand(cmd, target, context, params)
      }
      console.log(`* Executed ${commandName} command for ${context.username}`)
    }
  }

  runBuiltin (cmd, target, context, params) {
    const commandHandler = builtinCommands[cmd.name]
    if (!commandHandler) { return }
    commandHandler(target, context, params, (target, context, message) => {
      this.sendMessage(target, context, message)
    })
  }

  runUser (cmd, target, context, params) {
    if (isString(cmd)) {
      this.sendMessage(target, context, cmd.value)
      return
    }

    if (isFile(cmd)) {
      try {
        let msg = fs.readFileSync(cmd.value, 'utf-8')
        this.chatClient.say(target, msg)
      } catch (e) {
        // TODO: write the error into the event log
        this.sendMessage(target, context, `Sorry, ${cmd.name} not configured yet.`)
      }
    }
  }

  handle (cmd, target, context, params) {
    console.log('handling ', cmd, target, context, params)
    // Handle the builtin commands
    if (cmd.name in builtinCommands) {
      this.runBuiltin(cmd, target, context, params)
    } else {
      this.runUser(cmd, target, context, params)
    }
  }

  handleAliasCommand (aliasCmd, target, context, params) {
    // TODO: don't assume the commands are split via comma
    let commands = aliasCmd.value.split(',')
    let msg = commands.map(commandName => {
      let cmd = global.commands.find(function (e) {
        if (e.name.toLowerCase() === commandName.trim().toLowerCase()) {
          return e
        }
      })
      // TODO: support other command types in the alias. Disabled for now due to IRC
      // throttling
      if (cmd.type === 'string') {
        return `[${cmd.name}: ${cmd.value}]`
      }
    }).join(',')
    this.chatClient.say(target, msg)
  }

  // Helper function to send the correct type of message:
  sendMessage (target, context, message) {
    if (context['message-type'] === 'whisper') {
      this.chatClient.whisper(target, message)
    } else {
      this.chatClient.say(target, message)
    }
  }
}

module.exports = { Runner }
