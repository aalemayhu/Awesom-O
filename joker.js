var giveMeAJoke = require('give-me-a-joke')

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  let date = new Date()
  let seed = date.getMonth() + date.getFullYear() + date.getMinutes() + date.getMilliseconds() + date.getSeconds()
  return Math.floor(Math.random(seed) * (max - min)) + min
}

function randomJoke (callback) {
  let pick = getRandomInt(1, 3)

  switch (pick) {
    case 1:
      console.log('random dad joke')
      giveMeAJoke.getRandomDadJoke(function (joke) {
        callback(joke)
      })
      break
    case 2:
      console.log('random Chuck Norris joke')
      giveMeAJoke.getRandomCNJoke(function (joke) {
        callback(joke)
      })
      break
    case 3:
      console.log('random Jackie Chan joke')
      var fn = 'Jackie'
      var ln = 'Chan'
      giveMeAJoke.getCustomJoke(fn, ln, function (joke) {
        callback(joke)
      })
      break
  }
}

module.exports = {
  randomJoke
}
