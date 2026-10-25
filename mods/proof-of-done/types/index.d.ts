declare module "claude-code" {
  interface PluginState {
    "proof-of-done": {
      evidence: { testsRun: boolean; lastCmd?: string; lastExit?: number };
    };
  }
}
