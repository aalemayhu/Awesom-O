'use strict'

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { remote, ipcRenderer } = require('electron')
const { renderCommands } = require('./src/js/views/commands.js')
const { renderConfigure } = require('./src/js/views/configuration.js')
const { renderNewCommand } = require('./src/js/views/new-command.js')
var $ = require('jquery')
const { version } = require('./package.json')
const notifier = require('node-notifier')
const path = require('path')

// Set the app version in the UI
let title = $('#app-version')
title.text(`Awesom-O v${version}`)
title.css('text-align', 'center')

// This is required for the initial load of the index.html file
$('#container').load('../../src/pages/commands.html', function () {
  renderCommands()
  updateHeight()
})

function pickViewToRender (view) {
  if (view.endsWith('commands.html')) {
    $('#container').load('../../src/pages/commands.html', function () {
      renderCommands()
      updateHeight()
    })
  } else if (view.endsWith('new-command.html')) {
    $('#container').load('../../src/pages/new-command.html', function () {
      renderNewCommand(renderCommands)
      updateHeight()
    })
  } else if (view.endsWith('configuration.html')) {
    $('#container').load('../../src/pages/configuration.html', function () {
      renderConfigure()
      updateHeight()
    })
  }
}

function updateHeight () {
  // Set the default minimum height
  var height = 0
  $.each($('body').children(), function (i, v) {
    height += $(v).outerHeight(true)
  })
  console.log(height)
  ipcRenderer.send('set-height', ~~(height * 1.1))
}

// View changes from the main process
ipcRenderer.on('view', function (event, view) {
  console.log(`view -> (${event}, ${view})`)
  pickViewToRender(view)
})

ipcRenderer.on('display-notification', function (event, notification) {
  console.log(`display-notification -> (${event}, ${notification})`)
  let title = notification.title
  let body = notification.body
  let icon = notification.icon
  let isSilent = remote.getGlobal('silent')

  if (process.platform === 'darwin') {
    // TODO: use the avatar for user
    let n = new Notification(title, { body: body, silent: isSilent, icon: icon})
    return
  }

  notifier.notify({
    title: title,
    message: body,
    icon: path.join(__dirname, 'assets/icons/png/128x128.png'),
    contentImage: icon,
    sound: !isSilent
  })
})
