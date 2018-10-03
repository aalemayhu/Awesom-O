const {app} = require('electron')
const fs = require('fs')

const directory = app.getPath('home') // /home folder on OS X
const cacheDirectory = `${directory}/twitch-bot-cache` // /home/twitch-bot-cache/
const cacheDataFile = `${cacheDirectory}/data.json` // /home/twitch-bot-cache/data.json

function createCacheDirectory() {
  if (fs.existsSync(cacheDirectory) === false) {
    fs.mkdirSync(cacheDirectory)
  }
}

const fsCache = {
  save(name, value) {
    createCacheDirectory()
    let newData = this.readAll('data')
    newData[name] = value
    console.log('newData: '+newData)
    fs.writeFileSync(cacheDataFile, JSON.stringify(newData, null, 2))
  },
  readAll(file) {
    let data = {}

    createCacheDirectory()
    try {
      const cacheContent = fs.readFileSync(`${cacheDirectory}/${file}.json` , 'utf-8')

      try {
        const _data = JSON.parse(cacheContent)
        data = _data
      } catch (e) {
        data = {}
      }
    } catch (err) {
      console.log('Error in Cache:', err)
    }
    return data
  },
}

module.exports = {
    cacheDataFile,
    fsCache
}
