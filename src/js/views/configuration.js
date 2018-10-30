'use strict'

const { remote, ipcRenderer } = require('electron')
const path = require('path')
const { valueForPalette } = require(path.join(__dirname, '../util/colour_palettes.js'))

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
  $('#channel-jokes-file').val(c.jokesFilePath)
  $('#colour-palette-select').val(c.colourPalette)

  $('#configuration-page-title').css('padding', '16px 8px 0px 0px')

  $('#new-configuration-submit').click(function () {
    var c = {
      name: $('#channel-name').val().toLowerCase(),
      bot: $('#channel-bot').val().toLowerCase(),
      oauth: $('#channel-oauth').val(),
      prefix: $('#channel-command-prefix').val(),
      autoconnect: $('#channel-autoconnect').is(':checked'),
      silent: $('#channel-notifications').is(':checked'),
      standupReminder: $('#channel-notification-break').is(':checked'),
      shouldGreetUser: $('#channel-greet-user').is(':checked'),
      jokesFilePath: $('#channel-jokes-file').val(),
      colourPalette: $('#colour-palette-select option:selected').val()
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

  $('#channel-jokes-file').click(function () {
    ipcRenderer.send('import-jokes-file', '')
  })

  ipcRenderer.on('selected-jokes-file', function (event, jokesFilePath) {
    $('#channel-jokes-file').val(jokesFilePath)
  })
}

module.exports = {
  renderConfigure
}
