import { env } from 'node:process'

export default {
  bin: {
    PROMPT: "\x1b[36mgptie \x1b[0m"
  },
  api: {
    API_KEY: env.OPENAI_API_KEY,
    ERROR_LABEL: '\x1b[31mERROR\x1b[0m',
    OPENAI_MODEL: env.GPTIE_OPENAI_MODEL || 'gpt-3.5-turbo'
  },
  terminal: {
    DEFAULT_DELIMITER: env.GPTIE_DEFAULT_DELIMITER || '---',
    EXIT_MESSAGE: '^C',
    MESSAGES_MAX_SIZE: env.GPTIE_MESSAGES_MAX_SIZE || '16',
    OUTPUT_TEMPLATE: "\x1b[32m%s\x1b[0m",
  }
}
