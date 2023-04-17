import readline from 'readline'
import { stdin, stdout } from 'node:process'
import { format } from 'node:util'

export const colors = {
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

export function createTerminal(prompt, options = {}) {
  const states = {
    input: false,
    block: false
  }
  const config = {
    delimiter: options.delimiter || false,
    spaced: options.spaced || false,
    exitMessage: options.exitMessage || '^C',
    promptColor: options.promptColor || colors.DEFAULT,
    outputColor: options.outputColor || colors.DEFAULT
  }
  const reader = readline.createInterface({
    input: stdin,
    output: stdout,
    history: [],
    prompt: `${config.promptColor}${prompt}${colors.DEFAULT}`
  })

  let inputs = []

  // listen user input
  const listen = function (onSubmit) {
    // handle pipe input
    if (!stdin.isTTY || !stdout.isTTY) {
      reader.prompt()

      if (config.delimiter) {
        stdout.write(config.delimiter + '\n')
        states.block = true
      }

      stdin.on('end', () => {
        if (config.delimiter) {
          stdout.write(config.delimiter + '\n')
          states.block = false
        }

        submit(onSubmit, false)
      })
    }

    // handle Ctrl-C
    reader.on('SIGINT', () => {
      close()

      stdout.write(config.exitMessage + '\n')
    })

    // enter new line
    reader.on('line', (line) => {
      if (line == '' && inputs.length == 0) {
        reader.prompt()
        return
      }

      if (line != config.delimiter) {
        inputs.push(line)
      }

      if (config.delimiter && line == config.delimiter) {
        states.block = !states.block
      }

      if (states.block) {
        reader.prompt()
        return
      }

      submit(onSubmit, true)
    })

    reader.prompt()
  }

  const submit = function (onSubmit, reopen) {
    const content = inputs.join('\n').trim()

    if (content.length > 0) {
      inputs = []

      reader.pause()

      if (config.spaced)
        stdout.write('\n')

      stdout.write(config.outputColor)

      onSubmit(content, () => {
        stdout.write(colors.DEFAULT)

        if (reopen) {
          if (config.spaced)
            stdout.write('\n')

          reader.resume()
          reader.prompt()
        }
      })
    }
  }

  const close = function () {
    reader.close()
  }

  const input = function (body = '') {
    reader.write(`${body}\n`)
  }

  const output = function (body) {
    stdout.write(body)
  }

  return { listen, close, input, output }
}
