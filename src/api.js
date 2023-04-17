import { Configuration, OpenAIApi } from 'openai'
import { exit } from 'node:process'
import config from './config.js'

export function createChat(model) {
  let response

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: config.OPENAI_API_KEY
    })
  )

  const warn = function (message, description = null) {
    console.log(config.ERROR_LABEL, message)

    if (description)
      console.log(description)
  }

  const storeMessage = function (role, content) {
    const last = global.messages[global.messages.length - 1]

    if (last && last.role == role) {
      last.content += content

      return
    }

    if (global.messages.length == config.MESSAGES_PER_CONVERSATION) {
      global.messages.splice(0, 1)
    }

    global.messages.push({ role, content })
  }

  const requestStream = async function (body, callbacks = {}) {
    global.messages ||= []

    storeMessage('user', body)

    try {
      response = await openai.createChatCompletion(
        {
          model: model || config.OPENAI_MODEL,
          temperature: Number(config.OPENAI_TEMPERATURE),
          messages: global.messages,
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
              storeMessage('assistant', content)

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
