import readline from 'readline'
import { stdin, stdout } from 'node:process'
import { EventEmitter } from 'node:events'

const colors = {
  DEFAULT: '\x1b[0m',
  BLACK:   '\x1b[30m',
  RED:     '\x1b[31m',
  GREEN:   '\x1b[32m',
  YELLOW:  '\x1b[33m',
  BLUE:    '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN:    '\x1b[36m',
  WHITE:   '\x1b[37m'
}

const labels = {
  IDLE: '$ ',
  BLOCK: '│ ',
  ENDBLOCK: '└ '
}

export function createTerminal (options = {}) {
  const terminal = {}
  const emmiter = new EventEmitter()

  let reader = null
  let output = []
  let block = false
  let delimiter = options.delimiter

  const colorize = function (message) {
    return colors.CYAN + message + colors.DEFAULT
  }

  const formatLine = function (label, line) {
    stdout.write('\x1b[1A\x1b[2K')
    stdout.write(colorize(label + line))
    stdout.write('\n')
  }

  terminal.open = function () {
    const { ask, emit } = this

    reader = readline.createInterface({
      input: stdin,
      output: stdout,
      history: []
    })

    // Handle Ctrl-C
    reader.on('SIGINT', () => {
      reader.close()

      stdout.write('^C\n')
    })

    // Enter new line
    reader.on('line', (line) => {
      if (line === '' && output.length === 0) {
        return ask()
      }

      // delimiter input

      if (delimiter) {
        if (line === delimiter) {
          block = !block

          if (block) {
            formatLine(labels.IDLE, line)

            return ask()
          }

          else {
            formatLine(labels.ENDBLOCK, line)

            stdout.write('\n') // space input/output

            return emit()
          }
        } else {
          output.push(line)
        }
      }

      // valid input

      if (block) {
        formatLine(labels.BLOCK, line)

        return ask()
      } else {
        formatLine(labels.IDLE, line)

        stdout.write('\n') // space input/output

        return emit()
      }
    })

    this.ask()
  }

  terminal.close = function () {
    reader && reader.close()
  }

  terminal.on = function (event, listener) {
    return emmiter.on(event, listener)
  }

  terminal.emit = function () {
    emmiter.emit('submit', output.join('\n').trim())

    output = []
  }

  terminal.ask = function () {
    reader.setPrompt(colorize(!block ? labels.IDLE : labels.BLOCK))
    reader.prompt()
  }

  terminal.push = function (text) {
    output.push(text)
  }

  return terminal
}
