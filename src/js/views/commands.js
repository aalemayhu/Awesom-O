'use strict'

const { remote, ipcRenderer } = require('electron')

var $ = require('jQuery')

function renderCommands () {
  // Get the table
  var table = document.getElementById('commands-table')
  var rowCount = table.rows.length
  // For now just clear out the table
  for (var i = 1; i < rowCount; i++) {
    table.deleteRow(1)
  }

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
      tr.css('color', 'green')
    })
    tr.mouseleave(function () {
      tr.css('color', 'white')
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
