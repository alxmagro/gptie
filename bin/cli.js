#!/usr/bin/env node
import { stdin, stdout, exit } from 'node:process'

import { createChat } from '../src/api.js'
import { createTerminal } from '../src/terminal.js'

import { readFile, getFlag, getParam } from '../src/helpers.js'
import config from '../src/config.js'

// arguments

const flagHelp       = getFlag('-h', '--help')
const flagVersion    = getFlag('-v', '--version')
const model          = getParam('-m')
const query          = getParam('-q')
const delimiter      = getParam('-d', config.DEFAULT_DELIMITER)
const noninteractive = query || !stdin.isTTY || !stdout.isTTY

if (flagHelp) {
  console.log(readFile('help.txt', { local: true }))
  exit(0)
}

if (flagVersion) {
  console.log('v' + JSON.parse(readFile('../package.json', { local: true })))
  exit(0)
}

const { requestStream } = createChat(model)
const terminal = createTerminal({ delimiter: delimiter })

terminal.on('submit', (input) => {
  requestStream(input, {
    data: (chunk) => stdout.write(chunk),
    done: () => {
      if (noninteractive)
        terminal.close()

      else
        stdout.write('\n') && terminal.ask()
    },
    fail: (error) => console.error(config.ERROR_LABEL, error) && exit(1)
  })
})

if (noninteractive) {
  if (query)
    terminal.push(query + '\n')

  if (!stdin.isTTY)
    terminal.push(readFile(0))

  terminal.emit()
}

else {
  terminal.open()
}
