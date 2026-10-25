import { describe, expect, test } from "claude-code/testing";
import { findSecret } from "../hooks/secret-sentry.mjs";
describe("secret-sentry", () => {
  test("detects github token and env assignment", () => {
    expect(findSecret("token ghp_abcdefghijklmnopqrstuvwxyz")).toBe("github-token");
    expect(findSecret("API_KEY=supersecretvalue")).toBe("env-assignment");
    expect(findSecret("const x = 1")).toBeNull();
  });
  test("denies Write with secret", async ($, on) => {
    on("session.start", ($, e) => ({ cwd: e.cwd }));
    on("tool.call", { tool: "Write" }, () => ({ result: { ok: true } }));
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" } as any);
    const r = await $.tool.call({ tool: "Write", file_path: "a.env", content: "OPENAI_API_KEY=sk-abcdefghijklmnopqrstuvwxyz" } as any);
    expect(JSON.stringify(r)).toMatch(/Secret Sentry blocked|deny/i);
  });
});
