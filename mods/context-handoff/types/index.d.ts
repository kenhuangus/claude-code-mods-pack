declare module "claude-code" {
  interface PluginState {
    "context-handoff": {
      meta: { percent: number; warned: boolean; handoff?: string };
    };
  }
}
