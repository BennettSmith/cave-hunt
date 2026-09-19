import assert from "node:assert/strict"
import test from "node:test"

import { commitHookBypassReason } from "../lib/commit-hook-guard.mjs"
import { CommitHookGuard } from "../plugins/commit-hook-guard.js"

const rejected = [
  "git commit --no-verify -m 'skip hooks'",
  "git commit -n -m 'skip hooks'",
  "git commit -an -m 'skip hooks'",
  "git commit -na -m 'skip hooks'",
  "git -C . commit -n -m 'skip hooks'",
  "/usr/bin/git commit --no-verify -m 'skip hooks'",
  "command git commit -n -m 'skip hooks'",
  "env GIT_AUTHOR_NAME=Agent git commit --no-verify -m 'skip hooks'",
  "git status && git commit -n -m 'skip hooks'",
  'git commit "-n" -m "skip hooks"',
  "git -c core.hooksPath=/dev/null commit -m 'skip hooks'",
  "git -ccore.hooksPath=/dev/null commit -m 'skip hooks'",
  "git config --local core.hooksPath /dev/null",
  "git config --unset core.hooksPath",
  "git config --unset-all core.hooksPath",
  "git config --replace-all core.hooksPath /dev/null",
  "git config --add core.hooksPath /dev/null",
]

for (const command of rejected) {
  test(`rejects ${command}`, () => {
    assert.notEqual(commitHookBypassReason(command), "")
  })
}

const allowed = [
  "git commit -m 'feat: add notes'",
  "git commit -am 'fix: update notes'",
  "git commit -mnotes",
  "git status --porcelain",
  "git config core.hooksPath",
  "git config --get core.hooksPath",
  "git config --local --get core.hooksPath",
  "git config --get-all core.hooksPath",
  "git config --show-origin --get core.hooksPath",
  "git config --show-scope --get core.hooksPath",
  "printf '%s' 'git commit --no-verify'",
  "go test ./...",
]

for (const command of allowed) {
  test(`allows ${command}`, () => {
    assert.equal(commitHookBypassReason(command), "")
  })
}

test("plugin rejects a bypass before Bash execution", async () => {
  const hooks = await CommitHookGuard()
  await assert.rejects(
    hooks["tool.execute.before"](
      { tool: "bash" },
      { args: { command: "git commit --no-verify -m blocked" } },
    ),
    /repository hooks must run/,
  )
})

test("plugin allows an ordinary commit", async () => {
  const hooks = await CommitHookGuard()
  await hooks["tool.execute.before"](
    { tool: "bash" },
    { args: { command: "git commit -m allowed" } },
  )
})
