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

function newCommand() {
  console.log('new command');
  // prompt('new command');
  //

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
    row.insertCell(2).innerHTML = c.description
  }
}

document.querySelector('#connect-button').addEventListener('click', connectBot);
document.querySelector('#disconnect-button').addEventListener('click', disconnectBot);
document.querySelector('#new-command-button').addEventListener('click', newCommand);

renderCommands()
