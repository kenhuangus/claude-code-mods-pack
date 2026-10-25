declare module "claude-code" {
  interface PluginState {
    "usage-meter": {
      snapshot: { tokens: number; window: number; percent: number; costUsd?: number };
      warmPings: number;
    };
  }
}
