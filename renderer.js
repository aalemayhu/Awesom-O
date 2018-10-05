'use strict'

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// TODO: don't require all the view files but check the URL and load the appropriate one

// Setup the index page
require('./views/index.js')

// Setup the new command page
require('./views/new-command.js')

// Setup the configuration page
require('./views/configuration.js')
