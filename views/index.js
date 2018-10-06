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

  var commands = remote.getGlobal('commands')
  let tbody = $('tbody:last')
  for (let i = 0; i < commands.length; i++) {
    let c = commands[i]
    let tr = $(`<tr id='${c.name}'></tr>`)

    let enabledTD = $('<td></td>')
    enabledTD.css('text-align', 'center')
    let checkBox = $(`<input type="checkbox">`)
    checkBox.attr('checked', c.enabled)
    checkBox.click(function () {
      c.enabled = !c.enabled
      ipcRenderer.send('new-command', c)
    })
    enabledTD.append(checkBox)
    if (!c.enabled) {
      tr.css('color', 'gray')
    }
    tr.append(enabledTD)

    tr.append(`<td>${c.name}</td>`)
    tr.append(`<td>${c.description}</td>`)
    tbody.append(tr)

    // Callback handling
    tr.mouseenter(function () {
      let button = $(`<button id='${c.name}-button' type="button" class="btn btn-info">Edit</button>`)
      let descriptionNode = $(this).find('td:last')
      descriptionNode.append(button)
      descriptionNode.find('button:last').click(function () {
        // Using row.id here so we avoid the # sign
        ipcRenderer.send('selected-command', c.name)
      })

      button.attr('class', 'btn-sm')
      button.css('float', 'right')
      button.css('margin', '-30px')
    })
    tr.mouseleave(function () {
      let descriptionNode = $(this).find('td:last')
      descriptionNode.find('button:last').remove()
    })
  }
}

let isConnected = remote.getGlobal('isConnected')
let connectedLabel = $('#connection-state-status')
connectedLabel.text(isConnected ? 'Connected' : 'Disconnected')

// TODO: fix disconnect class not being used
let connectButton = $('#connection-state-action')
connectButton.css('css', isConnected ? 'btn btn-danger' : 'btn btn-success')
connectButton.text(isConnected ? 'Disconnect' : 'Connect')

renderCommands()

// Wire up the button click handlers

connectButton.click(function () {
  if (isConnected) {
    ipcRenderer.send('disconnect-bot', 'disconnect')
  } else {
    ipcRenderer.send('connect-bot', 'connect')
  }
})

$('#new-command-button').click(function () {
  remote.getCurrentWindow().loadFile('new-command.html')
})

$('#configuration-button').click(function () {
  remote.getCurrentWindow().loadFile('configuration.html')
})
