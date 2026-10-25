import { describe, expect, test } from "claude-code/testing";
describe("session-map", () => {
  test("tracks reads and /files lists them", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    on("tool.call", { tool: "Read" }, () => ({ result: { content: "hi" } }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    await $.tool.call({ tool: "Read", file_path: "src/a.ts" } as any);
    await $.tool.call({ tool: "Read", file_path: "src/b.ts" } as any);
    const listed = await $.command.run({ command: "files" } as any);
    expect(JSON.stringify(listed)).toMatch(/src\/a\.ts/);
    expect(JSON.stringify(listed)).toMatch(/src\/b\.ts/);
    const ui = await $.ui.mount({ plugin: "session-map", surface: "terminal", component: "AbovePrompt", props: { hasSurvey: false, isWorking: false, maxRows: 8, bodyColumns: 100 } } as any);
    expect(await ui.find({ type: "Text", text: /FILES 2/ })).toBeDefined();
    await ui.unmount();
  });
});
