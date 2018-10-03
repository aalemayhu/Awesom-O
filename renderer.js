// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {remote, ipcRenderer} = require('electron')

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
    row.insertCell(2).innerHTML = c.value
    row.insertCell(3).innerHTML = c.description
  }
}

function newCommandSubmit() {
  var cmd = {}
  cmd.name = document.querySelector('#command-name').value.toLowerCase();
  let selectedIndex = document.querySelector(".custom-select").selectedIndex
  cmd.type = document.querySelector(".custom-select")[selectedIndex].text.toLowerCase()
  cmd.value = document.querySelector('#command-value').value;
  cmd.description = document.querySelector('#command-description').value;
  ipcRenderer.send('new-command', cmd);
}

function newCommandCancel() {
  console.log('newCommandCancel()')
  remote.getCurrentWindow().loadFile('index.html')
}

// index.html
if (document.querySelector('#connect-button')) {
  document.querySelector('#connect-button').addEventListener('click', connectBot);

  renderCommands()
}
if (document.querySelector('#disconnect-button')) {
  document.querySelector('#disconnect-button').addEventListener('click', disconnectBot);
}

// new-command.html
if (document.querySelector('#new-command-submit')) {
  document.querySelector('#new-command-submit').addEventListener('click', newCommandSubmit)
}
if (document.querySelector('#new-command-cancel')) {
  document.querySelector('#new-command-cancel').addEventListener('click', newCommandCancel)
}
