const NOTE = { plugin: "peer-reflect", key: "note" };
const PENDING = { plugin: "peer-reflect", key: "pendingTools" };
export function reflect(tools) {
  const t = tools || [];
  const bits = ["Did we verify with a test or repro?", "Any edge cases left unchecked?"];
  if (t.includes("Bash")) bits.push("Was the shell command least-privilege?");
  if (t.includes("Edit") || t.includes("Write")) bits.push("Any secrets or drive-by refactors?");
  if (t.includes("Agent")) bits.push("Was a subagent necessary, or could the parent finish it?");
  return "PEER: " + bits.slice(0, 3).join(" · ");
}
export function register(on) {
  on("session.start", async ($, e, next) => {
    const r = await next(e);
    await $.state.set(NOTE, { text: "PEER: waiting for first turn", turn: 0 });
    await $.state.set(PENDING, []);
    return r;
  });
  on("tool.call", async ($, e, next) => {
    if (e.tool) {
      const { value: pending = [] } = await $.state.get(PENDING);
      await $.state.set(PENDING, [...pending, String(e.tool)]);
    }
    return next(e);
  });
  on("turn.complete", async ($, e, next) => {
    const r = await next(e);
    if (e.agentId) return r;
    const { value: pending = [] } = await $.state.get(PENDING);
    const { value: note } = await $.state.get(NOTE);
    const text = reflect(pending);
    await $.state.set(NOTE, { text, turn: (note?.turn ?? 0) + 1 });
    await $.state.set(PENDING, []);
    return r;
  });
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props?.hasSurvey) return next(e);
    const { value: note } = await $.state.get(NOTE);
    if (!note?.text) return next(e);
    const { Box, Text } = $.ui.resolve(e);
    return Box({ paddingX: 1, children: [Text({ color: "cyan", children: note.text })] });
  });
}
