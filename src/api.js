import { Configuration, OpenAIApi } from 'openai'
import config from './config.js'

function warn (message, description = null) {
  console.log(config.api.ERROR_LABEL, message)

  if (description)
    console.log(description)
}

export async function createChat(body, callbacks = {}) {
  const messages = typeof body === 'string'
    ? [{ role: 'user', content: body }]
    : body

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: config.api.API_KEY
    })
  )

  try {
    const response = await openai.createChatCompletion(
      {
        model: config.api.OPENAI_MODEL,
        messages: messages,
        stream: true,
      },
      { responseType: 'stream' }
    )

    const stream = response.data

    stream.on('data', (chunk) => {
      // Messages in the event stream are separated by a pair of newline characters.

      const payloads = chunk.toString().split("\n\n")

      for (const payload of payloads) {
        if (payload.includes('[DONE]')) return;
        if (payload.startsWith("data:")) {
          // in case there's multiline data event
          const data = payload.replaceAll(/(\n)?^data:\s*/g, '')

          try {
            const delta = JSON.parse(data.trim())
            const content = delta.choices[0].delta?.content

            if (content !== undefined) {
              callbacks.data(content)
            }
          } catch (error) {
            // nothing
          }
        }
      }
    })
    stream.on('end', () => callbacks.done())
    stream.on('error', (error) => {
      warn(error.message)

      callbacks.error(error)
    })
  } catch (error) {
    if (error.response.status == 401) {
      warn(error.message, 'Make sure your env key OPENAI_API_KEY is set.')
    }

    else {
      warn(error.message)
    }
  }
}
