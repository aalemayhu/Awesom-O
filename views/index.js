'use strict'

const { remote, ipcRenderer } = require('electron')
var $ = require('jQuery')

function connectBot () {
  ipcRenderer.send('connect-bot', 'connect')
}

function disconnectBot () {
  ipcRenderer.send('disconnect-bot', 'disconnect')
}

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
    })
    $(rowId).mouseleave(function () {
      console.log(`${buttonId}.remove()`)
      let descriptionNode = $(this).find('td:last')
      descriptionNode.find('button:last').remove()
    })
  }
}

function newCommand () {
  remote.getCurrentWindow().loadFile('new-command.html')
}

function exportCommand () {
  ipcRenderer.send('export-command', '')
}

function importCommand () {
  ipcRenderer.send('import-command', '')
}

function configuration () {
  remote.getCurrentWindow().loadFile('configuration.html')
}

// index.html
if (document.querySelector('#connect-button')) {
  document.querySelector('#connect-button').addEventListener('click', connectBot)

  renderCommands()
}
if (document.querySelector('#disconnect-button')) {
  document.querySelector('#disconnect-button').addEventListener('click', disconnectBot)
}

if (document.querySelector('#export-command-button')) {
  document.querySelector('#export-command-button').addEventListener('click', exportCommand)
}

if (document.querySelector('#import-command-button')) {
  document.querySelector('#import-command-button').addEventListener('click', importCommand)
}

if (document.querySelector('#new-command-button')) {
  document.querySelector('#new-command-button').addEventListener('click', newCommand)
}

if (document.querySelector('#configuration-button')) {
  document.querySelector('#configuration-button').addEventListener('click', configuration)
}
