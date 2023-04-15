import { argv } from 'node:process'

import Terminal from './src/terminal.js'
import { createChat } from './src/api.js'

// arguments

const query = argv.includes('-q') ? argv[argv.indexOf('-q') + 1] : null
const delimiter = argv.includes('-d') ? argv[argv.indexOf("-d") + 1] : null

// main

const terminal = new Terminal(delimiter)
const callAPI = function (input) {
  createChat(input, {
    data: (res) => {
      terminal.receive(res)
    },
    done: () => {
      if (query) {
        terminal.receive('\n')
        terminal.close()
      } else {
        terminal.receive('\n\n')
        terminal.prompt()
      }
    },
    error: (error) => {
      terminal.close()
      console.log("\n\nERROR: ", error)
    }
  })
}

query ? callAPI(query) : terminal.listen(msg => callAPI(msg))
