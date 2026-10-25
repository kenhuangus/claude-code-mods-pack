import { describe, expect, test } from "claude-code/testing";
import { mask } from "../hooks/recording-mode.mjs";
describe("recording-mode", () => {
  test("mask redacts email and secret", () => {
    const { text, masked } = mask("mail a@b.com key sk_test_abc12345 price $12.50");
    expect(text).toContain("[EMAIL]");
    expect(text).toContain("[SECRET]");
    expect(text).toContain("[AMOUNT]");
    expect(masked).toBeGreaterThanOrEqual(3);
  });
  test("toggle recording shows banner", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    await $.command.run({ command: "recording", args: "on" } as any);
    const ui = await $.ui.mount({ plugin: "recording-mode", surface: "terminal", component: "AbovePrompt", props: { hasSurvey: false, isWorking: false, maxRows: 8, bodyColumns: 100 } } as any);
    expect(await ui.find({ type: "Text", text: /RECORDING/ })).toBeDefined();
    await ui.unmount();
  });
});
