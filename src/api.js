import { Configuration, OpenAIApi } from 'openai'
import { exit } from 'node:process'
import config from './config.js'

export function createChat() {
  const warn = function (message, description = null) {
    console.log(config.api.ERROR_LABEL, message)

    if (description)
      console.log(description)
  }

  const formatMessages = function (body) {
    return typeof body === 'string'
      ? [{ role: 'user', content: body }]
      : body
  }

  const requestStream = async function (body, callbacks = {}) {
    let response

    const openai = new OpenAIApi(
      new Configuration({
        apiKey: config.api.API_KEY
      })
    )

    try {
      response = await openai.createChatCompletion(
        {
          model: config.api.OPENAI_MODEL,
          messages: formatMessages(body),
          stream: true,
        },
        { responseType: 'stream' }
      )
    } catch (error) {
      switch(error.response.status) {
        case 401:
          warn(error.message, 'Make sure your env key OPENAI_API_KEY is set.')
          break

        default:
          warn(error.message)
          break
      }

      exit(1)
    }

    response.data.on('data', (chunk) => {
      // Messages in the event stream are separated by a pair of newline characters.
      const payloads = chunk.toString().split("\n\n")

      for (const payload of payloads) {
        if (payload.includes('[DONE]')) {
          callbacks.data('\n')

          return
        }

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
    response.data.on('end', () => callbacks.done())
    response.data.on('error', (error) => callbacks.fail(error))
  }

  return { requestStream }
}
