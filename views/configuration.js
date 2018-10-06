'use strict'

const { remote, ipcRenderer } = require('electron')
var $ = require('jQuery')

function configurationSubmit () {
  let c = {}
  c.name = document.querySelector('#channel-name').value.toLowerCase()
  c.bot = document.querySelector('#channel-bot').value.toLowerCase()
  c.oauth = document.querySelector('#channel-oauth').value
  c.autoconnect = document.querySelector('#channel-autoconnect').checked
  c.silent = document.querySelector('#channel-notifications').checked
  if (!c.name.startsWith('#')) {
    c.name = `'#${c.name}`
  }
  ipcRenderer.send('new-configuration', c)
}

function configurationCancel () {
  console.log('configurationCancel()')
  remote.getCurrentWindow().loadFile('index.html')
}

function render () {
  let c = remote.getGlobal('config')
  document.querySelector('#channel-name').value = c.name
  document.querySelector('#channel-bot').value = c.bot
  document.querySelector('#channel-oauth').value = c.oauth
  document.querySelector('#channel-autoconnect').checked = c.autoconnect
  document.querySelector('#channel-notifications').checked = c.silent
}

if (document.querySelector('#new-configuration-submit')) {
  document.querySelector('#new-configuration-submit').addEventListener('click', configurationSubmit)
  render()
}

if (document.querySelector('#new-configuration-cancel')) {
  document.querySelector('#new-configuration-cancel').addEventListener('click', configurationCancel)
}

$('#export-configuration-button').click(function () {
  ipcRenderer.send('export-command', '')
})

$('#import-configuration-button').click(function () {
  ipcRenderer.send('import-command', '')
})
