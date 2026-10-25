declare module "claude-code" {
  interface PluginState {
    "peer-reflect": {
      note: { text: string; turn: number };
      pendingTools: string[];
    };
  }
}
