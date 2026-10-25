declare module "claude-code" {
  interface PluginState {
    "model-router": {
      stats: { routedHaiku: number; routedPremium: number; last?: string };
    };
  }
}
