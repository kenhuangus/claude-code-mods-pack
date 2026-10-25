declare module "claude-code" {
  interface PluginState {
    "deletions-bin": {
      log: { count: number; last?: string };
    };
  }
}
