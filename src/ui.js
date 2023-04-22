import fs from 'fs'
import path from 'path'
import { env } from 'node:process'

const pathname = function (filename) {
  return path.resolve(new URL(filename, import.meta.url).pathname)
}

const pkg = JSON.parse(fs.readFileSync(pathname('../package.json'), 'utf-8'))

export function createUI (args, options = {}) {
  const ui = {}

  let _usage = null
  let _indentation = options.indentation || 36
  let _args = []
  let _envs = []

  ui.name = pkg.name
  ui.description = pkg.description
  ui.version = pkg.version
  ui.author = pkg.author
  ui.args = {}
  ui.envs = {}

  ui.usage = function (text) {
    _usage = text

    return this
  }

  ui.arg = function (name, param, description, defval) {
    const tags = name.split(',').map(item => item.trim())

    _args.push({ name, param, description, tags, defval })

    return this
  }

  ui.env = function (name, description, defval) {
    this.envs[name] = env[name] || defval

    _envs.push({ name, description, defval })

    return this
  }

  ui.help = function () {
    console.log(ui.description)
    console.log()
    console.log('Usage: ' + _usage)
    console.log()
    console.log('Options:')

    for (const option of _args) {
      let key = option.name
      let value = option.description

      if (option.param)
        key += ` <${option.param}>`

      console.log(`  ${key.padEnd(_indentation)} ${value};`)

      if (option.defval)
        console.log(`${''.padEnd(_indentation + 1)} (default: '${option.defval}')`)
    }

    console.log()
    console.log('Enviroment Variables:')

    for (const variable of _envs) {
      console.log(`  ${variable.name.padEnd(_indentation)} ${variable.description};`)

      if (variable.defval)
        console.log(`${''.padEnd(_indentation + 1)} (default: '${variable.defval}')`)
    }
  }

  ui.mount = function () {
    args.slice(2).forEach((arg, index) => {
      const option = _args.filter(item => item.tags.includes(arg))[0]

      if (option) {
        const name = option.tags[option.tags.length - 1].replace(/^[-]+/, '')

        if (option.param)
          this.args[name] = args.slice(2)[index + 1]

        else
          this.args[name] = true
      }
    })

    return this
  }

  return ui
}
