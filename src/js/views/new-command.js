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
    $('#command-name').val(cmd.name)
    $('#command-description').val(cmd.description)
    $('#command-enabled').prop('checked', cmd.enabled)

    if (cmd.type === 'builtin') {
      $('#form-group-command-value').remove()
      $('#form-group-command-type').remove()
      $('#command-name').prop('readonly', true)
      $('#command-description').prop('readonly', true)
    } else {
      document.querySelector('.custom-select').selectedIndex = cmd.type === 'string' ? 0 : 1
      $('#command-value').val(cmd.value)
    }
  }
}

$('#new-command-submit').click(function () {
  let name = $('#command-name').val().toLowerCase().trim()
  let value = $('#command-value').val()
  if (!name || !value) { return }
  var cmd = { name: name, value: value }
  let typeSelector = document.querySelector('.custom-select')
  if (typeSelector) {
    let selectedIndex = typeSelector.selectedIndex
    cmd.type = typeSelector[selectedIndex].text.toLowerCase()
  }
  cmd.description = $('#command-description').val()
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
