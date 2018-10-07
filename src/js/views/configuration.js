'use strict'

const { remote, ipcRenderer } = require('electron')
const { renderView } = require('./view_helper.js')
var $ = require('jQuery')

let c = remote.getGlobal('config')
if (c) {
  console.log(`config=${c}`)
  document.querySelector('#channel-name').value = c.name
  document.querySelector('#channel-bot').value = c.bot
  document.querySelector('#channel-oauth').value = c.oauth
  document.querySelector('#channel-autoconnect').checked = c.autoconnect
  document.querySelector('#channel-notifications').checked = c.silent
  document.querySelector('#channel-notification-break').checked = c.standupReminder
}
// Wire up the button click handlers

$('#new-configuration-submit').click(function () {
  let c = {}
  c.name = document.querySelector('#channel-name').value.toLowerCase()
  c.bot = document.querySelector('#channel-bot').value.toLowerCase()
  c.oauth = document.querySelector('#channel-oauth').value
  c.autoconnect = document.querySelector('#channel-autoconnect').checked
  c.silent = document.querySelector('#channel-notifications').checked
  c.standupReminder = document.querySelector('#channel-notification-break').checked

  if (!c.name.startsWith('#')) {
    c.name = `'#${c.name}`
  }
  ipcRenderer.send('save-configuration', c)
})

$('#new-configuration-cancel').click(function () {
  renderView('../../src/pages/index.html', './index.js')
})

$('#export-configuration-button').click(function () {
  ipcRenderer.send('export-command', '')
})

$('#import-configuration-button').click(function () {
  ipcRenderer.send('import-command', '')
})
