import { env } from 'node:process'

export default {
  api: {
    ERROR_LABEL: '\x1b[31mERROR\x1b[0m',
    API_KEY: env.OPENAI_API_KEY,
    API_MODEL: env.OPEN_API_MODEL || 'gpt-3.5-turbo'
  },
  terminal: {
    PROMPT: "\x1b[36mgptie \x1b[0m",
    OUTPUT_TEMPLATE: "\x1b[32m%s\x1b[0m",
    EXIT_MESSAGE: '^C',
    BLOCK_DELIMITER: env.GTPIE_BLOCK_DELIMITER || '---',
    MESSAGES_MAX_SIZE: env.GPTIE_MESSAGES_MAX_SIZE || '16',
  }
}