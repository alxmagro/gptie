import { env } from 'node:process'

export default {
  DEFAULT_DELIMITER: env.GPTIE_DEFAULT_DELIMITER || '---',
  ERROR_LABEL: '\x1b[31mERROR\x1b[0m',
  MESSAGES_PER_CONVERSATION: env.GPTIE_MESSAGES_PER_CONVERSATION || '16',
  OPENAI_API_KEY: env.OPENAI_API_KEY,
  OPENAI_MODEL: env.GPTIE_OPENAI_MODEL || 'gpt-3.5-turbo',
  OPENAI_TEMPERATURE: env.GPTIE_OPENAI_TEMPERATURE || '1'
}
