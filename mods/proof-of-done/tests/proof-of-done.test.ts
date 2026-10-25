import { describe, expect, test } from "claude-code/testing";
describe("proof-of-done", () => {
  test("claim-done blocked without tests", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    const a = await $.command.run({ command: "claim-done" } as any);
    expect(JSON.stringify(a)).toMatch(/PROOF REQUIRED/i);
  });
  test("bash npm test unlocks claim-done", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    on("tool.call", { tool: "Bash" }, () => ({ result: { exitCode: 0, stdout: "ok", stderr: "" } }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    await $.tool.call({ tool: "Bash", command: "npm test" } as any);
    const a = await $.command.run({ command: "claim-done" } as any);
    expect(JSON.stringify(a)).toMatch(/PROOF OK/i);
    const ui = await $.ui.mount({ plugin: "proof-of-done", surface: "terminal", component: "AbovePrompt", props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 80 } } as any);
    expect(await ui.find({ type: "Text", text: /PROOF ready/ })).toBeDefined();
    await ui.unmount();
  });
});
