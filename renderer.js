'use strict'

const { ipcRenderer } = require('electron')

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

function pickViewToRender (currentView) {
  if (!currentView || currentView.endsWith('index.html')) {
    // Setup the index page
    require('./src/js/views/index.js')
  } else if (currentView.endsWith('new-command.html')) {
    // Setup the new command page
    require('./src/js/views/new-command.js')
  } else if (currentView.endsWith('configuration.html')) {
    // Setup the configuration page
    require('./src/js/views/configuration.js')
  }
}

// View changes from the main process
ipcRenderer.on('view', function (event, data) {
  pickViewToRender(data)
})

pickViewToRender(document.currentView)
