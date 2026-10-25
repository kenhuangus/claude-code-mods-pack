const NOTIFY = { plugin: "done-notify", key: "notify" };
const LONG_MS = 3000;
export function register(on) {
  on("session.start", async ($, e, next) => {
    const r = await next(e);
    await $.state.set(NOTIFY, { count: 0 });
    await $.command.register({ name: "notify-test", description: "Fire a sample completion toast" });
    return r;
  });
  on("turn.complete", async ($, e, next) => {
    const r = await next(e);
    if (e.agentId) return r;
    const ms = Number(e.durationMs ?? 0);
    if (ms >= LONG_MS) {
      const { value: n } = await $.state.get(NOTIFY);
      await $.state.set(NOTIFY, { count: (n?.count ?? 0) + 1, lastMs: ms });
      try { await $.ui.toast(`Turn done in ${Math.round(ms / 1000)}s`); } catch {}
    }
    return r;
  });
  on("command.run", { command: "notify-test" }, async ($) => {
    const { value: n } = await $.state.get(NOTIFY);
    await $.state.set(NOTIFY, { count: (n?.count ?? 0) + 1, lastMs: 0 });
    try { await $.ui.toast("Notify test — Claude Code finished a long task"); } catch {}
    return { text: "Notification fired." };
  });
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props?.hasSurvey) return next(e);
    const { value: n } = await $.state.get(NOTIFY);
    if (!n?.count) return next(e);
    const { Box, Text } = $.ui.resolve(e);
    return Box({ paddingX: 1, children: [Text({ color: "green", children: `NOTIFY sent:${n.count}` })] });
  });
}
