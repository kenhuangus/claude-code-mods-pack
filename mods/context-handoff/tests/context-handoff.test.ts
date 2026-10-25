import { describe, expect, test } from "claude-code/testing";
describe("context-handoff", () => {
  test("handoff returns snippet", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    on("session.usage", () => ({ value: { startedAt: 0, rateLimits: [], context: { tokens: 180000, window: 200000, percent: 90 } } }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/repo" } as any);
    const a = await $.command.run({ command: "handoff" } as any);
    expect(JSON.stringify(a)).toMatch(/HANDOFF SNIPPET/);
    expect(JSON.stringify(a)).toMatch(/90%/);
  });
  test("band warns after high context turn", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    on("session.usage", () => ({ value: { startedAt: 0, rateLimits: [], context: { tokens: 170000, window: 200000, percent: 85 } } }));
    on("turn.complete", () => ({ text: "" }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/repo" } as any);
    await $.turn.complete({ reason: "answer", answer: "ok", durationMs: 10 } as any);
    const ui = await $.ui.mount({ plugin: "context-handoff", surface: "terminal", component: "AbovePrompt", props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100 } } as any);
    expect(await ui.find({ type: "Text", text: /CONTEXT 85%/ })).toBeDefined();
    await ui.unmount();
  });
});
