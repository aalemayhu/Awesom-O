function valueForPalette (name) {
  if (!name) { return 0 }
  switch (name.toLowerCase()) {
    case 'black': { return 0 }
    case 'hipster': { return 1 }
    case 'macish': { return 2 }
    case '<><': { return 3 }
    case '[robot]': { return 4 }
    default: { return 0 }
  }
}
/*
{
Background
Text
Button ()
}
*/

module.exports = { valueForPalette }
