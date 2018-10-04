// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {remote, ipcRenderer} = require('electron')

// Setup the new command page
require('./views/new-command.js')


function connectBot() {
    console.log('connectBot');
    ipcRenderer.send('connect-bot', 'connect');
}

function disconnectBot() {
  console.log('disconnectBot');
  ipcRenderer.send('disconnect-bot', 'disconnect');
}

function renderCommands() {
  // Get the table
  var table = document.getElementById("commands-table");
  var rowCount = table.rows.length;
  // For now just clear out the table
  for (var i = 1; i < rowCount; i++) {
      table.deleteRow(1);
  }

  var commands = remote.getGlobal('commands');
  for (let i = 0; i < commands.length; i++) {
    let c = commands[i]
    let row = table.insertRow(1);
    row.insertCell(0).innerHTML = c.name
    row.insertCell(1).innerHTML = c.type
    if (c.value) {
      row.insertCell(2).innerHTML = c.value
    } else {
      row.insertCell(2).innerHTML = ""
    }
    row.insertCell(3).innerHTML = c.description
  }
}

function newCommand() {
  remote.getCurrentWindow().loadFile('new-command.html')
}

function exportCommand() {
  ipcRenderer.send('export-command', '');
}

function importCommand() {
  ipcRenderer.send('import-command', '');
}

// index.html
if (document.querySelector('#connect-button')) {
  document.querySelector('#connect-button').addEventListener('click', connectBot);

  renderCommands()
}
if (document.querySelector('#disconnect-button')) {
  document.querySelector('#disconnect-button').addEventListener('click', disconnectBot);
}

if (document.querySelector('#export-command-button')) {
  document.querySelector('#export-command-button').addEventListener('click', exportCommand);
}

if (document.querySelector('#import-command-button')) {
  document.querySelector('#import-command-button').addEventListener('click', importCommand);
}

if (document.querySelector('#new-command-button')) {
  document.querySelector('#new-command-button').addEventListener('click', newCommand);
}
