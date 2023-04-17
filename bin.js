#!/usr/bin/env node
import fs from 'fs'
import { argv, stdin, stdout, exit } from 'node:process'
import { createChat } from './src/api.js'
import { createTerminal, colors } from './src/terminal.js'
import config from './src/config.js'

// arguments

const version   = argv.includes('-v') || argv.includes('--version')
const help      = (argv.includes('-h') || argv.includes('--help'))
const model     = argv.includes('-m') ? argv[argv.indexOf('-m') + 1] : null
const query     = argv.includes('-q') ? argv[argv.indexOf('-q') + 1] : null
const delimiter = argv.includes('-d') ? argv[argv.indexOf("-d") + 1] : config.DEFAULT_DELIMITER
const pipeinput = !stdin.isTTY || !stdout.isTTY

if (help) {
  console.log(fs.readFileSync('./help.txt', 'utf8'))
  exit(0)
}

if (version) {
  console.log('v' + JSON.parse(fs.readFileSync('./package.json')).version)
  exit(0)
}

const terminal = createTerminal('gptie ', {
  delimiter: delimiter,
  spaced: true,
  promptColor: colors.CYAN,
  outputColor: colors.GREEN
})
const { requestStream } = createChat(model)

terminal.listen((input, done) => {
  requestStream(input, {
    data: (content) => {
      terminal.output(content)
    },

    done: () => {
      if (!query) done()
    },

    fail: (err) => {
      terminal.close()
      console.log('\n' + config.ERROR_LABEL, err)
    }
  })
})

if (query) {
  terminal.input(query)

  // split query and pipe messages
  if (pipeinput) terminal.input()
}
