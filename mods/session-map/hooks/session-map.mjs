const MAP = { plugin: "session-map", key: "map" };
export function register(on) {
  on("session.start", async ($, e, next) => {
    const r = await next(e);
    await $.state.set(MAP, { files: [] });
    await $.command.register({ name: "files", description: "List files read in this session" });
    return r;
  });
  on("tool.call", { tool: "Read" }, async ($, e, next) => {
    const result = await next(e);
    const path = e.file_path || e.path || e.filePath;
    if (path) {
      const { value: map } = await $.state.get(MAP);
      const files = [...(map?.files ?? [])];
      if (!files.includes(path)) files.push(path);
      await $.state.set(MAP, { files: files.slice(-40) });
    }
    return result;
  });
  on("command.run", { command: "files" }, async ($) => {
    const { value: map } = await $.state.get(MAP);
    const files = map?.files ?? [];
    if (!files.length) return { text: "No files read yet." };
    return { text: files.map((f, i) => `${i + 1}. ${f}`).join("\n") };
  });
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props?.hasSurvey) return next(e);
    const { value: map } = await $.state.get(MAP);
    const n = map?.files?.length ?? 0;
    if (!n) return next(e);
    const last = map.files[map.files.length - 1];
    const { Box, Text } = $.ui.resolve(e);
    return Box({
      paddingX: 1,
      children: [Text({ color: "blue", bold: true, children: `FILES ${n}  last:${last}` })],
    });
  });
}
