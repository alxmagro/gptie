import readline from 'readline'
import { stdin, stdout } from 'node:process'
import { format } from 'node:util'
import config from './config.js'

export function createTerminal(prompt, options = {}) {
  const log = []
  const lines = []
  const delimiter = options.delimiter || config.terminal.DEFAULT_DELIMITER
  const reader = readline.createInterface({
    input: stdin,
    output: stdout,
    history: [],
    prompt: prompt
  })

  debugger

  let isBlock = false

  const memorize = function (role, content) {
    const last = log[log.length - 1]

    if (last && last.role == role) {
      last.content += content
    } else {
      log.push({ role, content })
    }

    while (log.length > config.terminal.MESSAGES_MAX_SIZE) {
      log.splice(0, 1)
    }
  }

  const submit = function (onSubmit) {
    const content = lines.join('\n').trim()

    if (content.length > 0) {
      memorize('user', lines.join('\n'))
      lines.length = 0

      reader.pause()
      stdout.write('\n')

      onSubmit(log)
    }
  }

  const receive = function (body) {
    const output = format(config.terminal.OUTPUT_TEMPLATE, body)

    memorize('assistant', body)

    stdout.write(output)
  }

  const ready = function () {
    if (reader.history.length > 0)
      stdout.write('\n')

    reader.resume()
    reader.prompt()
  }

  const close = function () {
    reader.close()
  }

  const listen = function (onSubmit) {
    reader.on('SIGINT', () => {
      close()

      stdout.write(config.terminal.EXIT_MESSAGE + '\n')
    })

    reader.on('line', (line) => {
      if (line == '' && lines.length == 0) {
        reader.prompt()
        return
      }

      if (line == delimiter) {
        isBlock = !isBlock
      }

      if (line != delimiter) {
        lines.push(line)
      }

      if (!isBlock) {
        submit(onSubmit)
      } else {
        reader.prompt()
      }
    })

    reader.prompt()
  }

  return { listen, receive, ready, close }
}
