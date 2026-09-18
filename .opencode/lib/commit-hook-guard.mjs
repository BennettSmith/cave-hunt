const shellSeparators = new Set([";", "&&", "||", "|", "\n"])
const gitOptionsWithValues = new Set([
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--config-env",
])
const commitShortOptionsWithValues = new Set(["C", "c", "F", "m", "t", "S", "u"])

export function commitHookBypassReason(command) {
  for (const words of shellCommands(tokenizeShell(command))) {
    const git = gitInvocation(words)
    if (!git) continue

    if (git.subcommand === "config" && mentionsHooksPath(git.arguments)) {
      return "changing core.hooksPath is not allowed"
    }
    if (git.subcommand !== "commit") continue
    if (git.overridesHooksPath) {
      return "overriding core.hooksPath is not allowed"
    }
    if (git.arguments.includes("--no-verify")) {
      return "git commit --no-verify is not allowed"
    }
    if (git.arguments.some(disablesVerificationWithShortOption)) {
      return "git commit -n is not allowed"
    }
  }
  return ""
}

function tokenizeShell(command) {
  const tokens = []
  let token = ""
  let quote = ""
  let escaped = false

  const flush = () => {
    if (token !== "") tokens.push(token)
    token = ""
  }

  for (let index = 0; index < command.length; index += 1) {
    const character = command[index]
    if (escaped) {
      token += character
      escaped = false
      continue
    }
    if (character === "\\" && quote !== "'") {
      escaped = true
      continue
    }
    if (quote) {
      if (character === quote) quote = ""
      else token += character
      continue
    }
    if (character === "'" || character === '"') {
      quote = character
      continue
    }
    if (/\s/.test(character)) {
      flush()
      if (character === "\n") tokens.push("\n")
      continue
    }
    const pair = command.slice(index, index + 2)
    if (pair === "&&" || pair === "||") {
      flush()
      tokens.push(pair)
      index += 1
      continue
    }
    if (character === ";" || character === "|") {
      flush()
      tokens.push(character)
      continue
    }
    token += character
  }
  flush()
  return tokens
}

function shellCommands(tokens) {
  const commands = []
  let current = []
  for (const token of tokens) {
    if (shellSeparators.has(token)) {
      if (current.length > 0) commands.push(current)
      current = []
    } else {
      current.push(token)
    }
  }
  if (current.length > 0) commands.push(current)
  return commands
}

function gitInvocation(words) {
  let index = 0
  if (words[index] === "command") index += 1
  if (words[index] === "env") {
    index += 1
    while (index < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[index])) {
      index += 1
    }
  }
  const executable = words[index]
  if (!executable || executable.split("/").pop() !== "git") return null
  index += 1

  let overridesHooksPath = false
  while (index < words.length && words[index].startsWith("-")) {
    const option = words[index]
    if (option.startsWith("-c") && !option.startsWith("--") && option.length > 2) {
      overridesHooksPath ||= isHooksPathSetting(option.slice(2))
      index += 1
      continue
    }
    const [name, attached = ""] = option.split("=", 2)
    if ((name === "-c" || name === "--config-env") && attached) {
      overridesHooksPath ||= isHooksPathSetting(attached)
      index += 1
      continue
    }
    if (gitOptionsWithValues.has(name)) {
      const value = attached || words[index + 1] || ""
      if (name === "-c" || name === "--config-env") {
        overridesHooksPath ||= isHooksPathSetting(value)
      }
      index += attached ? 1 : 2
      continue
    }
    index += 1
  }

  if (index >= words.length) return null
  return {
    subcommand: words[index],
    arguments: words.slice(index + 1),
    overridesHooksPath,
  }
}

function mentionsHooksPath(arguments_) {
  return arguments_.some((argument) =>
    argument.toLowerCase().replace(/[^a-z.]/g, "").includes("core.hookspath"),
  )
}

function isHooksPathSetting(value) {
  return value.toLowerCase().startsWith("core.hookspath=")
}

function disablesVerificationWithShortOption(argument) {
  if (!/^-[^-]/.test(argument)) return false
  const cluster = argument.slice(1)
  for (const option of cluster) {
    if (option === "n") return true
    if (commitShortOptionsWithValues.has(option)) return false
  }
  return false
}
