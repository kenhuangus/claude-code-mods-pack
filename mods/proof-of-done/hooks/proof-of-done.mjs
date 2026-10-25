const EV = { plugin: "proof-of-done", key: "evidence" };
const TEST_RE = /\b(npm test|npm run test|pnpm test|yarn test|pytest|cargo test|go test|vitest|jest)\b/i;
export function register(on) {
  on("session.start", async ($, e, next) => {
    const r = await next(e);
    await $.state.set(EV, { testsRun: false });
    await $.command.register({ name: "claim-done", description: "Mark work done only if verification evidence exists" });
    return r;
  });
  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    const cmd = String(e.command ?? "");
    const result = await next(e);
    if (TEST_RE.test(cmd)) {
      const exit =
        typeof result?.exitCode === "number"
          ? result.exitCode
          : typeof result?.result?.exitCode === "number"
            ? result.result.exitCode
            : 0;
      await $.state.set(EV, { testsRun: exit === 0, lastCmd: cmd, lastExit: exit });
    }
    return result;
  });
  on("command.run", { command: "claim-done" }, async ($) => {
    const { value: ev } = await $.state.get(EV);
    if (!ev?.testsRun) {
      return { text: "PROOF REQUIRED: run a local test command (npm test / pytest / etc.) successfully before claiming done." };
    }
    return { text: `PROOF OK: verified via \`${ev.lastCmd}\` (exit ${ev.lastExit ?? 0}).` };
  });
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props?.hasSurvey) return next(e);
    const { value: ev } = await $.state.get(EV);
    const { Box, Text } = $.ui.resolve(e);
    const ok = !!ev?.testsRun;
    return Box({
      paddingX: 1,
      children: [Text({ color: ok ? "green" : "yellow", bold: true, children: ok ? "PROOF ready" : "PROOF missing" })],
    });
  });
}
