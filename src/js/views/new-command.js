'use strict'

const { remote, ipcRenderer } = require('electron')
var $ = require('jQuery')

let selectedCommand = remote.getGlobal('selectedCommand')
if (selectedCommand) {
  let cmd = remote.getGlobal('commands').find(function (cmd) {
    if (cmd.name === selectedCommand) {
      return cmd
    }
  })

  if (cmd) {
    console.log('prefix:')
    console.log(cmd)
    document.querySelector('#command-name').value = cmd.name
    document.querySelector('#command-description').value = cmd.description
    document.querySelector('#command-enabled').checked = cmd.enabled

    if (cmd.type === 'builtin') {
      document.querySelector('#form-group-command-value').remove()
      document.querySelector('#form-group-command-type').remove()
      document.querySelector('#command-name').readOnly = true
      document.querySelector('#command-description').readOnly = true
    } else {
      document.querySelector('.custom-select').selectedIndex = cmd.type === 'string' ? 0 : 1
      document.querySelector('#command-value').value = cmd.value
    }
  }
}

$('#new-command-submit').click(function () {
  var cmd = {}
  let typeSelector = document.querySelector('.custom-select')
  if (typeSelector) {
    let selectedIndex = typeSelector.selectedIndex
    cmd.type = typeSelector[selectedIndex].text.toLowerCase()
  }

  let value = document.querySelector('#command-value')
  if (value) {
    cmd.value = value.value
  }

  cmd.name = document.querySelector('#command-name').value.toLowerCase()
  cmd.description = document.querySelector('#command-description').value
  cmd.enabled = document.querySelector('#command-enabled').checked
  ipcRenderer.send('save-command', cmd)
})

$('#new-command-cancel').click(function () {
  console.log('newCommandCancel()')
  remote.getCurrentWindow().loadFile('src/pages/index.html')
})

$('#new-command-delete').click(function () {
  ipcRenderer.send('delete-command', $('#channel-name').val())
})
