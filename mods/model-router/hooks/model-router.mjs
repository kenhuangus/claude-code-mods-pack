const STATS = { plugin: "model-router", key: "stats" };
const SIMPLE = /\b(unit test|docstring|comment|rename|typo|format|lint|changelog|readme)\b/i;
export function pickModel(prompt, current) {
  if (SIMPLE.test(String(prompt ?? ""))) return { model: "haiku", tier: "haiku" };
  return { model: current || "sonnet", tier: "premium" };
}
export function register(on) {
  on("session.start", async ($, e, next) => {
    const r = await next(e);
    await $.state.set(STATS, { routedHaiku: 0, routedPremium: 0 });
    return r;
  });
  on("tool.call", { tool: "Agent" }, async ($, e, next) => {
    const prompt = e.prompt ?? e.description ?? e.input ?? "";
    const choice = pickModel(prompt, e.model);
    const { value: stats } = await $.state.get(STATS);
    if (choice.tier === "haiku") {
      await $.state.set(STATS, { routedHaiku: (stats?.routedHaiku ?? 0) + 1, routedPremium: stats?.routedPremium ?? 0, last: "haiku" });
      return next({ ...e, model: "haiku" });
    }
    await $.state.set(STATS, { routedHaiku: stats?.routedHaiku ?? 0, routedPremium: (stats?.routedPremium ?? 0) + 1, last: "premium" });
    return next(e);
  });
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props?.hasSurvey) return next(e);
    const { value: stats } = await $.state.get(STATS);
    if (!stats) return next(e);
    const { Box, Text } = $.ui.resolve(e);
    return Box({
      paddingX: 1,
      children: [Text({ dimColor: true, children: `ROUTER haiku:${stats.routedHaiku} premium:${stats.routedPremium}` })],
    });
  });
}
