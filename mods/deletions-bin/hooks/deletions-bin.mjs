const LOG = { plugin: "deletions-bin", key: "log" };
const DANGER = /^\s*(rm\s+(-[rRf]+\s+)*.+|unlink\s+|del\s+)/i;
export function register(on) {
  on("session.start", async ($, e, next) => {
    const r = await next(e);
    await $.state.set(LOG, { count: 0 });
    return r;
  });
  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    const cmd = String(e.command ?? "");
    if (!DANGER.test(cmd)) return next(e);
    // Soft-guard: rewrite rm -rf path -> mkdir bin && mv path bin/
    const m = cmd.match(/\brm\s+(?:-[a-zA-Z]+\s+)*(.+)$/);
    const target = (m?.[1] || "UNKNOWN").trim();
    const safe = `mkdir -p .claude/deletions-bin && mv -- ${target} .claude/deletions-bin/ 2>/dev/null || mv ${target} .claude/deletions-bin/`;
    const { value: log } = await $.state.get(LOG);
    await $.state.set(LOG, { count: (log?.count ?? 0) + 1, last: target });
    return next({ ...e, command: safe });
  });
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props?.hasSurvey) return next(e);
    const { value: log } = await $.state.get(LOG);
    if (!log?.count) return next(e);
    const { Box, Text } = $.ui.resolve(e);
    return Box({ paddingX: 1, children: [Text({ color: "yellow", bold: true, children: `DELETIONS-BIN rescued:${log.count}` })] });
  });
}
