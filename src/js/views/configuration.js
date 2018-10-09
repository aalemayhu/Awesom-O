'use strict'

const { remote, ipcRenderer } = require('electron')
var $ = require('jQuery')

function renderConfigure () {
  let c = remote.getGlobal('config')
  $('#channel-name').val(c.name)
  $('#channel-bot').val(c.bot)
  $('#channel-oauth').val(c.oauth)
  $('#channel-command-prefix').val(c.prefix)
  $('#channel-autoconnect').prop('checked', c.autoconnect)
  $('#channel-notifications').prop('checked', c.silent)
  $('#channel-notification-break').prop('checked', c.standupReminder)
  $('#channel-greet-user').prop('checked', c.shouldGreetUser)

  $('#new-configuration-submit').click(function () {
    var c = {
      name: $('#channel-name').val().toLowerCase(),
      bot: $('#channel-bot').val().toLowerCase(),
      oauth: $('#channel-oauth').val(),
      prefix: $('#channel-command-prefix').val(),
      autoconnect: $('#channel-autoconnect').is(':checked'),
      silent: $('#channel-notifications').is(':checked'),
      standupReminder: $('#channel-notification-break').is(':checked'),
      shouldGreetUser: $('#channel-greet-user').is(':checked')
    }

    if (!c.name) {
      $('#channel-name').focus()
      return
    }
    if (!c.bot) {
      $('#channel-bot').focus()
    }
    if (!c.oauth) {
      $('#channel-oauth').focus()
    }

    if (!c.name.startsWith('#')) {
      c.name = `'#${c.name}`
    }
    ipcRenderer.send('save-configuration', c)
  })

  $('#new-configuration-cancel').click(function () {
    remote.getCurrentWindow().webContents.send('view', 'commands.html')
  })

  $('#export-configuration-button').click(function () {
    ipcRenderer.send('export-command', '')
  })

  $('#import-configuration-button').click(function () {
    ipcRenderer.send('import-command', '')
  })
}

module.exports = {
  renderConfigure
}
