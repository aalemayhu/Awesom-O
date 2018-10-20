'use strict'

const { remote, ipcRenderer } = require('electron')
const { types, isBuiltin } = require('../commands/types.js')
var $ = require('jQuery')

function renderNewCommand () {
  let selectedCommand = remote.getGlobal('selectedCommand')
  let cmd = remote.getGlobal('commands').find(function (cmd) {
    if (cmd.name === selectedCommand) {
      return cmd
    }
  })

  if (selectedCommand && cmd) {
    console.log('prefix:')
    console.log(cmd)
    $('#command-name').val(cmd.name.replace(remote.getGlobal('config').prefix, ''))
    $('#command-description').val(cmd.description)

    if (isBuiltin(cmd)) {
      $('#form-group-command-value').remove()
      $('#form-group-command-type').remove()
      $('#command-name').prop('readonly', true)
      $('#command-description').prop('readonly', true)
      $('#command-detailview-delete').hide()
    } else {
      document.querySelector('.custom-select').selectedIndex = types[cmd.type]
      $('#command-value').val(cmd.value)
    }
  } else {
    $('#command-detailview-delete').hide()
  }

  let commandViewDetailStateLabel = $('#command-detailview-state')
  commandViewDetailStateLabel.text(cmd ? 'Edit command' : 'New command')
  commandViewDetailStateLabel.css('padding', '16px 8px 0px 0px')

  $('#command-detailview-submit').click(function () {
    var cmd = {
      name: $('#command-name').val().replace(/\s+/g, ''),
      value: $('#command-value').val()
    }
    if (!cmd.name) {
      $('#command-name').focus()
      return
    }
    if (!cmd.value) {
      $('#command-value').focus()
      return
    }
    let typeSelector = document.querySelector('.custom-select')
    if (typeSelector) {
      let selectedIndex = typeSelector.selectedIndex
      cmd.type = typeSelector[selectedIndex].text.toLowerCase()
    }
    cmd.description = $('#command-description').val()
    ipcRenderer.send('save-command', cmd)
  })

  $('#command-detailview-cancel').click(function () {
    remote.getCurrentWindow().webContents.send('view', 'commands.html')
  })

  $('#command-detailview-delete').click(function () {
    ipcRenderer.send('delete-command', $('#command-name').val())
  })
}

module.exports = {
  renderNewCommand
}
