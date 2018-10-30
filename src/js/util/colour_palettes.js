const black = { background: '#1F2125', text: 'white', button: 'green' }
const hipster = { background: 'blue', text: 'white', button: 'green' }
const macish = { background: 'white', text: 'black', button: 'lightgray' }
const fish = { background: 'green', text: 'white', button: 'blue' }
const robot = { background: 'lightgray', text: 'blue', button: 'purple' }

function colorsFor (name) {
  if (!name) { return black }
  switch (name.toLowerCase()) {
    case 'black': { return black }
    case 'hipster': { return hipster }
    case 'macish': { return macish }
    case '<><': { return fish }
    case '[robot]': { return robot }
    default: { return black }
  }
}

module.exports = { colorsFor }
