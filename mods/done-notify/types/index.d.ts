declare module "claude-code" {
  interface PluginState {
    "done-notify": {
      notify: { count: number; lastMs?: number };
    };
  }
}
