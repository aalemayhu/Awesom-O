'use strict'

const { renderNewCommand } = require('./src/js/views/command-detailview.js')
const { renderConfigure } = require('./src/js/views/configuration.js')
const { colorsFor } = require('./src/js/util/colour_palettes.js')
const { renderCommands } = require('./src/js/views/commands.js')
const { remote, ipcRenderer } = require('electron')
const { version } = require('./package.json')
const notifier = require('node-notifier')
const path = require('path')
var $ = require('jquery')

// Set the app version in the UI
$('#app-version').text(`${version}`)
$('#app-header').css('text-align', 'center')
$('#app-header').css('color', 'gray')

// This is required for the initial load of the index.html file
$('#container').load('../../src/pages/commands.html', function () {
  renderCommands()
  updateView('commands.html')
})

function pickViewToRender (view) {
  if (view.endsWith('commands.html')) {
    $('#container').load('../../src/pages/commands.html', function () {
      renderCommands()
      updateView(view)
    })
  } else if (view.endsWith('command-detailview.html')) {
    $('#container').load('../../src/pages/command-detailview.html', function () {
      renderNewCommand(renderCommands)
      updateView(view)
    })
  } else if (view.endsWith('configuration.html')) {
    $('#container').load('../../src/pages/configuration.html', function () {
      renderConfigure()
      updateView(view)
    })
  }
}

function updateView (view) {
  // Load the colour palette
  const paletteName = remote.getGlobal('config').colourPalette
  const colors = colorsFor(paletteName)
  const b = $('body')

  if (view.endsWith('commands.html')) {
    $('#commands-table').css('background', colors.background)
    $('#commands-table').css('color', colors.text)
  }

  b.css('background', colors.background)

  // Set the default minimum height
  var height = 0
  $.each(b.children(), function (i, v) {
    height += $(v).outerHeight(true)
    $(v).css('background', colors.background)
    $(v).css('color', colors.text)
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
