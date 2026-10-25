const META = { plugin: "context-handoff", key: "meta" };
const THRESHOLD = 80;
export function register(on) {
  on("session.start", async ($, e, next) => {
    const r = await next(e);
    await $.state.set(META, { percent: 0, warned: false });
    await $.command.register({ name: "handoff", description: "Package a concise handoff snippet for a new chat" });
    return r;
  });
  on("turn.complete", async ($, e, next) => {
    const r = await next(e);
    if (e.agentId) return r;
    const usage = await $.session.usage();
    const percent = usage?.context?.percent ?? 0;
    const { value: meta } = await $.state.get(META);
    const warned = percent >= THRESHOLD;
    await $.state.set(META, { ...(meta || {}), percent, warned });
    if (warned) {
      try { await $.ui.toast(`Context ${percent}% — run /handoff soon`); } catch {}
    }
    return r;
  });
  on("command.run", { command: "handoff" }, async ($) => {
    const usage = await $.session.usage();
    const percent = usage?.context?.percent ?? 0;
    const snippet = [
      "HANDOFF SNIPPET",
      "cwd: (session)",
      `context: ${percent}%`,
      "Continue from the current task. Prefer existing plans and open files. Do not re-read huge trees unless needed.",
    ].join("\n");
    const { value: meta } = await $.state.get(META);
    await $.state.set(META, { ...(meta || { warned: false }), percent, handoff: snippet });
    return { text: snippet };
  });
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props?.hasSurvey) return next(e);
    const { value: meta } = await $.state.get(META);
    if (!meta?.warned) return next(e);
    const { Box, Text } = $.ui.resolve(e);
    return Box({ paddingX: 1, children: [Text({ color: "magenta", bold: true, children: `CONTEXT ${meta.percent}% — /handoff` })] });
  });
}
