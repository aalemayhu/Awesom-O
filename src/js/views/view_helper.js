'user strict'

var $ = require('jQuery')

function renderView (page, script) {
  console.log(`renderView(${page}, ${script})`)
  document.currentView = page
  $('body').load(page, function () {
    console.log('document.ready()')
    require(script)
  })
}

module.exports = {
  renderView
}
