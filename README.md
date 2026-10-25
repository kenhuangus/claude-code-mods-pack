# kenhuang-mods — Practical Claude Code Mods

Ten tested Claude Code mods for everyday agent workflows.

## Install

```bash
claude plugin marketplace add kenhuangus/claude-code-mods-pack
claude plugin install usage-meter@kenhuang-mods
# or any other plugin name from the list below
```

Local path install:

```bash
claude plugin marketplace add /path/to/claude-code-mods-pack
```

## Mods

| Mod | What it does |
| --- | --- |
| `usage-meter` | Live token/cost band + `/warm-cache` |
| `proof-of-done` | Require test evidence before `/claim-done` |
| `context-handoff` | Context warning + `/handoff` snippet |
| `deletions-bin` | Rewrite `rm` into `.claude/deletions-bin` moves |
| `recording-mode` | `/recording on` redaction banner |
| `model-router` | Route simple Agent tasks to Haiku |
| `secret-sentry` | Block Write/Edit with secrets |
| `peer-reflect` | Peer-review checklist after each turn |
| `session-map` | Live file map + `/files` |
| `done-notify` | Toast on long turns + `/notify-test` |

## Test

```bash
# from repo root
for d in mods/*; do claude plugin validate "$d" && claude plugin test "$d" || exit 1; done
```

Requires Claude Code **2.1.302+** (mods / `claude plugin validate|test`).

## License

MIT
