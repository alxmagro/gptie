import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { argv } from 'node:process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function readFile (path, { local } = {}) {
  let file = local ? path.join(__dirname, path) : path

  return fs.readFileSync(file, 'utf8')
}

export function getFlag () {
  for (const argument of arguments) {
    if (argv.includes(argument)) return true
  }

  return false
}

export function getParam (param, fallback = null) {
  return argv.includes(param) ? argv[argv.indexOf(param) + 1] : fallback
}
