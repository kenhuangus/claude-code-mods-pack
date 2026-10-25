declare module "claude-code" {
  interface PluginState {
    "session-map": {
      map: { files: string[] };
    };
  }
}
