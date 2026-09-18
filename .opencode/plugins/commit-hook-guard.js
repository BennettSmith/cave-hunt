import { commitHookBypassReason } from "../lib/commit-hook-guard.mjs"

export const CommitHookGuard = async () => ({
  "tool.execute.before": async (input, output) => {
    if (input.tool !== "bash") return

    const reason = commitHookBypassReason(output.args.command ?? "")
    if (reason) {
      throw new Error(`${reason}; repository hooks must run`)
    }
  },
})
