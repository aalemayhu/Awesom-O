'use strict'

const { colorsFor } = require('./../util/colour_palettes.js')
const { renderConfigure } = require('./configuration.js')
const { renderNewCommand } = require('./new-command.js')
const { remote, ipcRenderer } = require('electron')
var $ = require('jquery')

function renderCommands () {
  const paletteName = remote.getGlobal('config').colourPalette
  const colors = colorsFor(paletteName)

  let prefix = remote.getGlobal('config').prefix
  var commands = remote.getGlobal('commands')
  let tbody = $('tbody:last')
  for (let i = 0; i < commands.length; i++) {
    let c = commands[i]
    let tr = $(`<tr id='${c.name}'></tr>`)

    let enabledTD = $('<td></td>')
    enabledTD.css('text-align', 'center')
    let checkBox = $(`<input type="checkbox">`)
    checkBox.attr('checked', c.enabled)
    checkBox.click(function (e) {
      e.stopPropagation()
      c.enabled = !c.enabled
      ipcRenderer.send('save-command', c)
    })
    enabledTD.append(checkBox)
    if (!c.enabled) {
      tr.css('color', 'gray')
    }
    tr.append(enabledTD)

    tr.append(`<td>${prefix}${c.name}</td>`)
    tr.append(`<td>${c.description}</td>`)
    tbody.append(tr)

    // Callback handling
    tr.click(function () {
      ipcRenderer.send('selected-command', c.name)
    })
    tr.mouseenter(function () {
      tr.css('color', colors.button)
    })
    tr.mouseleave(function () {
      tr.css('color', colors.text)
    })
  }

  let isConnected = remote.getGlobal('isConnected')

  let connectedLabel = $('#connection-state-status')
  connectedLabel.text(isConnected ? 'Connected' : 'Disconnected')
  connectedLabel.css('padding', '0px 8px 0px 0px')

  let connectButton = $('#connection-state-action')
  connectButton.attr('class', isConnected ? 'btn btn-danger' : 'btn btn-success')
  connectButton.text(isConnected ? 'Disconnect' : 'Connect')

  // Wire up the button click handlers
  connectButton.click(function () {
    if (isConnected) {
      ipcRenderer.send('disconnect-bot', 'disconnect')
    } else {
      ipcRenderer.send('connect-bot', 'connect')
    }
  })

  $('#command-detailview-button').click(function () {
    remote.getCurrentWindow().webContents.send('view', 'command-detailview.html')
  })

  $('#configuration-button').click(function () {
    remote.getCurrentWindow().webContents.send('view', 'configuration.html')
  })
}

module.exports = {
  renderCommands
}
