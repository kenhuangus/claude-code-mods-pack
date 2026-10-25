const SNAP = { plugin: "usage-meter", key: "snapshot" };
const WARM = { plugin: "usage-meter", key: "warmPings" };
function short(n) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}k`;
  return String(n);
}
async function readUsage($) {
  const usage = await $.session.usage();
  const context = usage?.context;
  if (!context?.window) return null;
  const tokens = context.tokens ?? 0;
  const percent = context.percent ?? Math.round((tokens / context.window) * 100);
  const costUsd = typeof usage?.cost?.totalUsd === "number" ? usage.cost.totalUsd : undefined;
  return { tokens, window: context.window, percent, costUsd };
}
export function register(on) {
  on("session.start", async ($, e, next) => {
    const r = await next(e);
    await $.state.set(WARM, 0);
    const snap = await readUsage($);
    if (snap) await $.state.set(SNAP, snap);
    await $.command.register({ name: "warm-cache", description: "Record a prompt-cache keep-warm ping" });
    return r;
  });
  on("turn.complete", async ($, e, next) => {
    const r = await next(e);
    if (!e.agentId) {
      const snap = await readUsage($);
      if (snap) await $.state.set(SNAP, snap);
    }
    return r;
  });
  on("command.run", { command: "warm-cache" }, async ($) => {
    const { value: n = 0 } = await $.state.get(WARM);
    const nextN = n + 1;
    await $.state.set(WARM, nextN);
    const snap = (await readUsage($)) || { tokens: 0, window: 200000, percent: 0 };
    await $.state.set(SNAP, snap);
    return { text: `Cache keep-warm ping #${nextN} recorded.` };
  });
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props?.hasSurvey) return next(e);
    const { value: snap } = await $.state.get(SNAP);
    const { value: warm = 0 } = await $.state.get(WARM);
    if (!snap) return next(e);
    const { Box, Text } = $.ui.resolve(e);
    const cost = typeof snap.costUsd === "number" ? `  $${snap.costUsd.toFixed(3)}` : "";
    return Box({
      flexDirection: "row",
      paddingX: 1,
      children: [
        Text({ color: snap.percent >= 85 ? "red" : snap.percent >= 60 ? "yellow" : "green", bold: true, children: `USAGE ${snap.percent}%` }),
        Text({ dimColor: true, children: `  ${short(snap.tokens)} / ${short(snap.window)}${cost}  warm:${warm}` }),
      ],
    });
  });
}
