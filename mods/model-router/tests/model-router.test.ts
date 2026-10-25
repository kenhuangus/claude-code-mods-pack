import { describe, expect, test } from "claude-code/testing";
import { pickModel } from "../hooks/model-router.mjs";
describe("model-router", () => {
  test("pickModel sends unit tests to haiku", () => {
    expect(pickModel("write unit test for parse()", "sonnet").tier).toBe("haiku");
    expect(pickModel("redesign auth architecture", "sonnet").tier).toBe("premium");
  });
  test("Agent tool call routes haiku", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    let model = "sonnet";
    on("tool.call", { tool: "Agent" }, ($, e) => {
      model = e.model;
      return { result: "ok" };
    });
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    await $.tool.call({ tool: "Agent", prompt: "add docstring to helper", model: "sonnet" } as any);
    expect(model).toBe("haiku");
    const ui = await $.ui.mount({ plugin: "model-router", surface: "terminal", component: "AbovePrompt", props: { hasSurvey: false, isWorking: false, maxRows: 8, bodyColumns: 80 } } as any);
    expect(await ui.find({ type: "Text", text: /haiku:1/ })).toBeDefined();
    await ui.unmount();
  });
});
