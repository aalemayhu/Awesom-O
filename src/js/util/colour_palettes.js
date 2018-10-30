const black = { background: 'black', text: 'white', button: 'green' }
const hipster = { background: 'blue', text: 'white', button: 'white' }
const macish = { background: 'white', text: 'black', button: 'gray' }
const fish = { background: 'green', text: 'white', button: 'blue' }
const robot = { background: 'gray', text: 'blue', button: 'gray' }

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
