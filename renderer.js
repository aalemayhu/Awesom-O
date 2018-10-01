// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

function connectBot() {
    console.log('connectBot');
}

function disconnectBot() {
  console.log('disconnectBot');
}

document.querySelector('#connect-button').addEventListener('click', connectBot);
document.querySelector('#disconnect-button').addEventListener('click', disconnectBot);
