'use strict'

const { remote, ipcRenderer } = require('electron')
var $ = require('jquery')

function renderNewCommand () {
  let selectedCommand = remote.getGlobal('selectedCommand')
  if (selectedCommand) {
    let cmd = remote.getGlobal('commands').find(function (cmd) {
      if (cmd.name === selectedCommand) {
        return cmd
      }
    })

    $('#command-name-hint').text(`lowercase it and no ${remote.getGlobal('config').prefix} prefix`)

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
        $('#new-command-delete').hide()
      } else {
        document.querySelector('.custom-select').selectedIndex = cmd.type === 'string' ? 0 : 1
        $('#command-value').val(cmd.value)
      }
    }
  } else {
    $('#new-command-delete').hide()
  }

  $('#new-command-submit').click(function () {
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
    cmd.enabled = document.querySelector('#command-enabled').checked
    ipcRenderer.send('save-command', cmd)
  })

  $('#new-command-cancel').click(function () {
    remote.getCurrentWindow().webContents.send('view', 'commands.html')
  })

  $('#new-command-delete').click(function () {
    ipcRenderer.send('delete-command', $('#command-name').val())
  })
}

module.exports = {
  renderNewCommand
}
