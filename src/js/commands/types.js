'use strict'

const types = Object.freeze(
  {
    'string': 0,
    'file': 1,
    'alias': 2
  }
)

function isString (cmd) {
  return cmd ? cmd.type.toLowerCase() === 'string' : false
}

function isAlias (cmd) {
  return cmd ? cmd.type.toLowerCase() !== 'alias' : false
}

function isBuiltin (cmd) {
  return cmd ? cmd.type.toLowerCase() === 'builtin' : false
}

function isFile (cmd) {
  return cmd ? cmd.type.toLowerCase() === 'file' : false
}

module.exports = {
  types,
  isString,
  isAlias,
  isBuiltin,
  isFile
}
