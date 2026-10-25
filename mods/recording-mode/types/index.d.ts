declare module "claude-code" {
  interface PluginState {
    "recording-mode": {
      mode: { on: boolean; masked: number };
    };
  }
}
