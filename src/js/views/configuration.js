'use strict'

const { remote, ipcRenderer } = require('electron')
var $ = require('jQuery')

function renderConfigure () {
  let c = remote.getGlobal('config')
  document.querySelector('#channel-name').value = c.name
  document.querySelector('#channel-bot').value = c.bot
  document.querySelector('#channel-oauth').value = c.oauth
  document.querySelector('#channel-autoconnect').checked = c.autoconnect
  document.querySelector('#channel-notifications').checked = c.silent
  document.querySelector('#channel-notification-break').checked = c.standupReminder

  $('#new-configuration-submit').click(function () {
    var c = {
      name: $('#channel-name').val().toLowerCase(),
      bot: $('#channel-bot').val().toLowerCase(),
      oauth: $('#channel-oauth').val(),
      autoconnect: document.querySelector('#channel-autoconnect').checked,
      silent: document.querySelector('#channel-notifications').checked,
      standupReminder: document.querySelector('#channel-notification-break').checked
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
