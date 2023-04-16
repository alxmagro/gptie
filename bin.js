#!/usr/bin/env node

import { argv, exit } from 'node:process'
import { createChat } from './src/api.js'
import { createTerminal } from './src/terminal.js'
import config from './src/config.js'

// arguments

const query     = argv.includes('-q') ? argv[argv.indexOf('-q') + 1] : null
const delimiter = argv.includes('-d') ? argv[argv.indexOf("-d") + 1] : null

const terminal = createTerminal(config.bin.PROMPT, {delimiter })
const chat = createChat()

if (query) {
  chat.requestStream(query, {
    data: (res) => { terminal.receive(res) },
    done: ()    => { terminal.close() },
    fail: (err) => { console.log('\n' + config.api.ERROR_LABEL, err) }
  })

  exit(0)
}

terminal.listen(input => {
  chat.requestStream(input, {
    data: (res) => {
      terminal.receive(res)
    },

    done: () => {
      terminal.ready()
    },

    fail: (err) => {
      terminal.close()
      console.log('\n' + config.api.ERROR_LABEL, err)
    }
  })
})
