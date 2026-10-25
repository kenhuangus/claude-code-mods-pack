import { describe, expect, test } from "claude-code/testing";
describe("usage-meter", () => {
  test("band shows usage after session.start", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    on("session.usage", () => ({ value: { startedAt: 0, rateLimits: [], context: { tokens: 50000, window: 200000, percent: 25 }, cost: { totalUsd: 0.42 } } }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    const ui = await $.ui.mount({ plugin: "usage-meter", surface: "terminal", component: "AbovePrompt", props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 120 } } as any);
    expect(await ui.find({ type: "Text", text: /USAGE 25%/ })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /50k \/ 200k/ })).toBeDefined();
    await ui.unmount();
  });
  test("warm-cache increments", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    on("session.usage", () => ({ value: { startedAt: 0, rateLimits: [], context: { tokens: 1000, window: 200000, percent: 1 } } }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    const a = await $.command.run({ command: "warm-cache" } as any);
    expect(JSON.stringify(a)).toMatch(/ping #1/i);
    const ui = await $.ui.mount({ plugin: "usage-meter", surface: "terminal", component: "AbovePrompt", props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 120 } } as any);
    expect(await ui.find({ type: "Text", text: /warm:1/ })).toBeDefined();
    await ui.unmount();
  });
});
