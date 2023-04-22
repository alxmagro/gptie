#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, stdin, stdout, exit } from 'node:process'
import { createUI } from './src/ui.js'
import { createChat } from './src/api.js'
import { createTerminal } from './src/terminal.js'

const ui = createUI(argv)

ui.usage('gptie [OPTIONS]')
  .arg('-h, --help', null, 'Show help')
  .arg('-v, --version', null, 'Show version')
  .arg('-q', 'QUERY', 'Non-interactive mode: Send query, print output and exit')
  .arg('-d', 'DELIMITER', 'Override delimiter that open/close multiline inputs')
  .arg('-m', 'MODEL', 'Override the model used to generate responses by OpenAI', 'gpt-3.5-turbo')
  .env('OPENAI_API_KEY', 'OpenAI API key (required)')
  .env('GPTIE_DEFAULT_DELIMITER', 'Defines the delimiter to be used to separate inputs', '---')
  .env('GPTIE_MESSAGES_PER_CONVERSATION', 'Defines the max size of conversation', '16')
  .env('GPTIE_OPENAI_MODEL', 'Define the default model to be used on chat', 'gpt-3.5-turbo')
  .env('GPTIE_OPENAI_TEMPERATURE', 'Degree of variability in the responses generated', '1')
  .mount()

const version        = ui.args.version
const help           = ui.args.help
const query          = ui.args.q
const delimiter      = ui.args.d || ui.envs.GPTIE_DEFAULT_DELIMITER
const model          = ui.args.m || ui.envs.GPTIE_OPENAI_MODEL
const noninteractive = query || !stdin.isTTY || !stdout.isTTY

if (help) {
  ui.help()

  exit(0)
}

if (version) {
  console.log(ui.version)
  exit(0)
}

const { requestStream } = createChat(model)
const terminal = createTerminal(delimiter)

terminal.on('submit', (input) => {
  requestStream(input, {
    data: (chunk) => stdout.write(chunk),
    done: () => {
      if (noninteractive)
        terminal.close()

      else
        stdout.write('\n') && terminal.ask()
    }
  })
})

if (noninteractive) {
  if (query)
    terminal.push(query + '\n')

  if (!stdin.isTTY)
    terminal.push(readFileSync(0))

  terminal.emit()
}

else {
  terminal.open()
}
