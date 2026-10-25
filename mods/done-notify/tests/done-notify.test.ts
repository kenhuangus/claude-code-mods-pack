import { describe, expect, test } from "claude-code/testing";
describe("done-notify", () => {
  test("long turn increments notify count", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    on("turn.complete", () => ({ text: "" }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    await $.turn.complete({ reason: "answer", answer: "ok", durationMs: 5000 } as any);
    const ui = await $.ui.mount({ plugin: "done-notify", surface: "terminal", component: "AbovePrompt", props: { hasSurvey: false, isWorking: false, maxRows: 8, bodyColumns: 80 } } as any);
    expect(await ui.find({ type: "Text", text: /NOTIFY sent:1/ })).toBeDefined();
    await ui.unmount();
  });
  test("notify-test command works", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    const a = await $.command.run({ command: "notify-test" } as any);
    expect(JSON.stringify(a)).toMatch(/Notification fired/i);
  });
});
