import readline from 'readline'
import { stdin, stdout } from 'node:process'
import { format } from 'node:util'
import config from './config.js'

const chat = []

function pushChat (role, content) {
  const last = chat[chat.length - 1]
  
  if (last && last.role == role) {
    last.content += content
  } else {
    chat.push({ role, content })
  }

  while (chat.length > config.terminal.MESSAGES_MAX_SIZE) {
    chat.splice(0, 1)
  }
}

export default class Terminal {
  constructor (delimiter) {
    this.delimiter = delimiter || config.terminal.BLOCK_DELIMITER
    this.blockOpened = false
    this.lines = []
    this.reader = readline.createInterface({
      input: stdin,
      output: stdout,
      history: [],
      prompt: config.terminal.PROMPT
    })
  }

  send (forward) {
    pushChat('user', this.lines.join('\n'))

    this.reader.pause()
    
    stdout.write('\n')

    forward(chat)
  }

  receive (body) {
    const output = format(config.terminal.OUTPUT_TEMPLATE, body)

    pushChat('assistant', body, { fragment: true })
  
    stdout.write(output)
  }

  prompt () {
    this.lines = []

    this.reader.resume()
    this.reader.prompt()
  }

  close () {
    this.reader.close()
  }

  listen (forward) {
    this.reader.on('SIGINT', () => {
      this.close()
      
      stdout.write(config.terminal.EXIT_MESSAGE + '\n')
    })
    this.reader.on('line', (line) => {
      if (line == '' && this.lines.length == 0) {
        this.reader.prompt()
        return
      }

      if (line == this.delimiter) {
        this.blockOpened = !this.blockOpened
      }

      this.lines.push(line)
      
      if (!this.blockOpened) {
        this.send(forward)
      } else {
        this.reader.prompt()
      }
    })

    this.reader.prompt()
  }
}