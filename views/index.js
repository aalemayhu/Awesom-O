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
  for (let i = 0; i < commands.length; i++) {
    let c = commands[i]
    let row = table.insertRow(1)
    row.insertCell(0).innerHTML = c.enabled
    row.insertCell(1).innerHTML = c.name
    row.insertCell(2).innerHTML = c.description
    // Callback handling
    row.id = c.name

    let rowId = `#${c.name}`
    let buttonId = `${rowId}-button`
    $(rowId).mouseenter(function () {
      let button = $(`<button id='${buttonId}' type="button" class="btn btn-info">Edit</button>`)
      let descriptionNode = $(this).find('td:last')
      descriptionNode.append(button)
      descriptionNode.find('button:last').click(function () {
        // Using row.id here so we avoid the # sign
        ipcRenderer.send('selected-command', row.id)
      })

      button.attr('class', 'btn-sm')
      button.css('float', 'right')
      button.css('margin', '-30px')
    })
    $(rowId).mouseleave(function () {
      console.log(`${buttonId}.remove()`)
      let descriptionNode = $(this).find('td:last')
      descriptionNode.find('button:last').remove()
    })
  }
}

renderCommands()

// Wire up the button click handlers

$('#connect-button').click(function () {
  ipcRenderer.send('connect-bot', 'connect')
})

$('#disconnect-button').click(function () {
  ipcRenderer.send('disconnect-bot', 'disconnect')
})

$('#export-command-button').click(function () {
  ipcRenderer.send('export-command', '')
})

$('#import-command-button').click(function () {
  ipcRenderer.send('import-command', '')
})

$('#new-command-button').click(function () {
  remote.getCurrentWindow().loadFile('new-command.html')
})

$('#configuration-button').click(function () {
  remote.getCurrentWindow().loadFile('configuration.html')
})
