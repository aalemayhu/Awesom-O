'use strict'

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let location = document.location.href

if (location.endsWith('index.html')) {
  // Setup the index page
  require('./src/js/views/index.js')
} else if (location.endsWith('new-command.html')) {
  // Setup the new command page
  require('./src/js/views/new-command.js')
} else if (location.endsWith('configuration.html')) {
  // Setup the configuration page
  require('./src/js/views/configuration.js')
}
