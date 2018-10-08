'use strict'

const { exec } = require('child_process')

function randomJoke (pyjokePath, callback) {
  exec(pyjokePath, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return
    }

    callback(stdout)
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
  })
}

module.exports = {
  randomJoke
}
