'use strict'

const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf } = format
const path = require('path')

require('winston-daily-rotate-file')

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
})

class LogHelper {
  constructor (logDirectory) {
    var transport = new (transports.DailyRotateFile)({
      filename: path.join(logDirectory, 'combined-%DATE%.log.txt'),
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '8m',
      maxFiles: '3d'
    })

    this.logger = createLogger({
      format: combine(
        label({ label: 'right meow!' }),
        timestamp(),
        myFormat
      ),
      transports: [transport]
    })
  }

  info (msg) {
    this.logger.log('info', msg)
  }

  debug (msg) {
    this.logger.log('debug', msg)
  }

  error (msg) {
    this.logger.log('error', msg)
  }
}

module.exports = { LogHelper }
