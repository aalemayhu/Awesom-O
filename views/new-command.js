const {remote, ipcRenderer} = require('electron')

function newCommandSubmit() {
  var cmd = {}
  cmd.name = document.querySelector('#command-name').value.toLowerCase();
  let selectedIndex = document.querySelector(".custom-select").selectedIndex
  cmd.type = document.querySelector(".custom-select")[selectedIndex].text.toLowerCase()
  cmd.value = document.querySelector('#command-value').value;
  cmd.description = document.querySelector('#command-description').value;
  cmd.enabled = document.querySelector("#command-enabled").checked;
  ipcRenderer.send('new-command', cmd);
}

function newCommandCancel() {
  console.log('newCommandCancel()')
  remote.getCurrentWindow().loadFile('index.html')
}

if (document.querySelector('#new-command-submit')) {
  document.querySelector('#new-command-submit').addEventListener('click', newCommandSubmit)
}
if (document.querySelector('#new-command-cancel')) {
  document.querySelector('#new-command-cancel').addEventListener('click', newCommandCancel)
}
