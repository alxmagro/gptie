#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { argv, stdin, stdout, exit } from 'node:process'

import { createChat } from '../src/api.js'
import { createTerminal, colors } from '../src/terminal.js'
import config from '../src/config.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// arguments

const showVer   = argv.includes('-v') || argv.includes('--version')
const showHelp  = (argv.includes('-h') || argv.includes('--help'))
const model     = argv.includes('-m') ? argv[argv.indexOf('-m') + 1] : null
const query     = argv.includes('-q') ? argv[argv.indexOf('-q') + 1] : null
const delimiter = argv.includes('-d') ? argv[argv.indexOf("-d") + 1] : config.DEFAULT_DELIMITER
const hasPipe   = !stdin.isTTY || !stdout.isTTY

if (showHelp) {
  const help = fs.readFileSync(path.join(__dirname, 'help.txt'), 'utf8')

  console.log(help);
  exit(0)
}

if (showVer) {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))

  console.log('v' + pkg.version)
  exit(0)
}

const terminal = createTerminal('gptie ', {
  delimiter: delimiter,
  spaced: true,
  promptColor: colors.CYAN,
  outputColor: colors[config.OUTPUT_COLOR_NAME] || colors.GREEN
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
  if (hasPipe) terminal.input()
}
