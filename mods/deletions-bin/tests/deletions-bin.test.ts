import { describe, expect, test } from "claude-code/testing";
describe("deletions-bin", () => {
  test("rewrites rm into deletions-bin move", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    let seen = "";
    on("tool.call", { tool: "Bash" }, ($, e) => {
      seen = String(e.command ?? "");
      return { result: { exitCode: 0, stdout: "", stderr: "" } };
    });
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    await $.tool.call({ tool: "Bash", command: "rm -rf build" } as any);
    expect(seen).toMatch(/deletions-bin/);
    expect(seen).toMatch(/build/);
    const ui = await $.ui.mount({ plugin: "deletions-bin", surface: "terminal", component: "AbovePrompt", props: { hasSurvey: false, isWorking: false, maxRows: 8, bodyColumns: 80 } } as any);
    expect(await ui.find({ type: "Text", text: /rescued:1/ })).toBeDefined();
    await ui.unmount();
  });
});
