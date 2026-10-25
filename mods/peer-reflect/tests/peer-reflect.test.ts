import { describe, expect, test } from "claude-code/testing";
import { reflect } from "../hooks/peer-reflect.mjs";
describe("peer-reflect", () => {
  test("reflect mentions bash when used", () => {
    expect(reflect(["Bash"])).toMatch(/shell command/i);
  });
  test("band updates after turn", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    on("turn.complete", () => ({ text: "" }));
    on("tool.call", { tool: "Read" }, () => ({ result: { content: "x" } }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    await $.tool.call({ tool: "Read", file_path: "a.ts" } as any);
    await $.turn.complete({ reason: "answer", answer: "ok", durationMs: 5 } as any);
    const ui = await $.ui.mount({ plugin: "peer-reflect", surface: "terminal", component: "AbovePrompt", props: { hasSurvey: false, isWorking: false, maxRows: 8, bodyColumns: 120 } } as any);
    expect(await ui.find({ type: "Text", text: /PEER:/ })).toBeDefined();
    await ui.unmount();
  });
});
