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

## Arguments

- `-q` - Query mode

```
$ gptie -q "how old is the universe?"
```

- `d` - Override block delimiter

```
$ gptie -d "==="
> ===
> Find the bug in the code below (Ruby)
>
> put "Hello World"
> ===
```

## Configuration

- `OPENAI_API_KEY`: OpenAI API key **(required)**
- `GTPIE_OPENAI_MODEL`: Specify GPT model in OpenAI (default: `'gpt-3.5-turbo'`)
- `GTPIE_BLOCK_DELIMITER`: Define block delimiter (default: `'---'`)
- `GPTIE_MESSAGES_MAX_SIZE`: Define the max number of messages send on request payload
  (default: `'16'`)

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, Alexandre Magro
