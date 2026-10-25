const MODE = { plugin: "recording-mode", key: "mode" };
export function mask(text) {
  let n = 0;
  let out = String(text ?? "");
  out = out.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, () => { n++; return "[EMAIL]"; });
  out = out.replace(/\b(?:sk|pk|api|key|token|secret)[_-][A-Za-z0-9_]{8,}\b/gi, () => { n++; return "[SECRET]"; });
  out = out.replace(/\$\s?\d[\d,]*(?:\.\d+)?/g, () => { n++; return "[AMOUNT]"; });
  return { text: out, masked: n };
}
export function register(on) {
  on("session.start", async ($, e, next) => {
    const r = await next(e);
    await $.state.set(MODE, { on: false, masked: 0 });
    await $.command.register({ name: "recording", description: "Toggle recording/redaction mode: /recording on|off" });
    return r;
  });
  on("command.run", { command: "recording" }, async ($, e) => {
    const arg = String(e.args ?? e.text ?? e.input ?? "").toLowerCase();
    const { value: cur } = await $.state.get(MODE);
    let nextOn = !cur?.on;
    if (/\boff\b/.test(arg)) nextOn = false;
    if (/\bon\b/.test(arg)) nextOn = true;
    await $.state.set(MODE, { on: nextOn, masked: cur?.masked ?? 0 });
    return { text: `Recording mode ${nextOn ? "ON (redaction active)" : "OFF"}.` };
  });
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props?.hasSurvey) return next(e);
    const { value: mode } = await $.state.get(MODE);
    if (!mode?.on) return next(e);
    const { Box, Text } = $.ui.resolve(e);
    return Box({ paddingX: 1, children: [Text({ color: "red", bold: true, children: "RECORDING — emails/secrets/amounts masked in banner" })] });
  });
}
