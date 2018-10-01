// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')

function connectBot() {
    console.log('connectBot');
    ipcRenderer.send('connect-bot', 'connect');
}

function disconnectBot() {
  console.log('disconnectBot');
  ipcRenderer.send('disconnect-bot', 'disconnect');
}

document.querySelector('#connect-button').addEventListener('click', connectBot);
document.querySelector('#disconnect-button').addEventListener('click', disconnectBot);
