#!/usr/bin/env node

import { argv, stdin, stdout } from 'node:process'
import { createChat } from './src/api.js'
import { createTerminal, colors } from './src/terminal.js'
import config from './src/config.js'

// arguments

const query     = argv.includes('-q') ? argv[argv.indexOf('-q') + 1] : null
const delimiter = argv.includes('-d') ? argv[argv.indexOf("-d") + 1] : config.DEFAULT_DELIMITER
const pipeinput = !stdin.isTTY || !stdout.isTTY

const terminal = createTerminal('gptie ', {
  delimiter: delimiter,
  spaced: true,
  promptColor: colors.CYAN,
  outputColor: colors.GREEN
})
const { requestStream } = createChat()

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
