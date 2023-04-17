# GPTie

User-friendly command-line client for the ChatGPT.

## Installation

- Install:

```shell
npm install -g gptie
```

- Generate the API key from the OpenAI dashboard
- Set the API key as the `OPENAI_API_KEY` environment variable

## Basic Usage

Just type, use `---` delimiter to write multiple lines, and `Ctrl-C` to exit:

<p align="center">
  <img src="assets/example.png"/>
</p>

## Advanced Usage

Append `stderr` to query to understand the errors:

```shell
$ node ./bug.js |& gptie -q "What is the error?"
```

Append `stdout` to query to understand the changes or to generate the commit message:

```shell
$ git diff | gptie -q "Explain me the changes"
```

## Arguments

- `-h`, `--help` - Show help
- `-v`, `--version` - Show Version
- `-q "QUERY"` - Query mode

```shell
$ gptie -q "how old is the universe?"
```

- `-d "DELIMITER"` - Override block delimiter

```
$ gptie -d "==="
> ===
> Find the bug in the code below (Ruby)
>
> put "Hello World"
> ===
```
- `-m "MODEL"` - Override OpenAI model

## Configuration

- `OPENAI_API_KEY`: OpenAI API key **(required)**
- `GPTIE_DEFAULT_DELIMITER`: Define block delimiter (default: `'---'`)
- `GPTIE_MESSAGES_PER_CONVERSATION`: Define the max number of messages send on request payload
  (default: `'16'`)
- `GPTIE_OPENAI_MODEL`: Specify GPT model on chat requests (default: `'gpt-3.5-turbo'`)
- `GPTIE_OPENAI_TEMPERATURE`: Specify GPT temperature on chat requests (default: `'1'`)
- `GPTIE_OUTPUT_COLOR_NAME`: Override default output color. Standard colors are available:
  [`'DEFAULT'`, `'BLACK'`, `'RED'`, `'GREEN'`, `'YELLOW'`, `'BLUE'`, `'MAGENTA'`, `'CYAN'`,
  `'WHITE'`]

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2023-present, Alexandre Magro
