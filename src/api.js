import { Configuration, OpenAIApi } from 'openai'
import { exit } from 'node:process'
import { env } from 'node:process'

const OPENAI_API_KEY = env.OPENAI_API_KEY
const MESSAGES_PER_CONVERSATION = env.GPTIE_MESSAGES_PER_CONVERSATION || '16'
const OPENAI_TEMPERATURE = env.GPTIE_OPENAI_TEMPERATURE || '1'

export function createChat(model) {
  let response

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: OPENAI_API_KEY
    })
  )

  const warn = function (message, description = null) {
    console.log('\x1b[31mERROR\x1b[0m', message)

    if (description)
      console.log(description)
  }

  const storeMessage = function (role, content) {
    const last = global.messages[global.messages.length - 1]

    if (last && last.role == role) {
      last.content += content

      return
    }

    if (global.messages.length == MESSAGES_PER_CONVERSATION) {
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
          model: model,
          temperature: Number(OPENAI_TEMPERATURE),
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
    response.data.on('error', (error) => warn(error) && exit(1))
  }

  return { requestStream }
}
