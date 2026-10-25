declare module "claude-code" {
  interface PluginState {
    "secret-sentry": {
      hits: { blocked: number; lastReason?: string };
    };
  }
}
