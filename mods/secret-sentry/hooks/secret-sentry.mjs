const HITS = { plugin: "secret-sentry", key: "hits" };
const RULES = [
  { re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, reason: "private-key-pem" },
  { re: /\b(?:sk|pk)-(?:live|test|proj)-[A-Za-z0-9]{16,}\b/, reason: "vendor-api-key" },
  { re: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/, reason: "aws-access-key" },
  { re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/, reason: "github-token" },
  { re: /(?:^|\n)\s*(?:API_KEY|SECRET_KEY|PASSWORD|TOKEN|OPENAI_API_KEY)\s*=\s*['"]?[^'\n\r]{8,}/i, reason: "env-assignment" },
];
export function findSecret(text) {
  const s = String(text ?? "");
  for (const rule of RULES) {
    if (rule.re.test(s)) return rule.reason;
  }
  return null;
}
async function guardWrite($, e, next) {
  const content = e.content ?? e.new_string ?? e.newString ?? e.payload ?? "";
  const reason = findSecret(content);
  if (!reason) return next(e);
  const { value: hits } = await $.state.get(HITS);
  await $.state.set(HITS, { blocked: (hits?.blocked ?? 0) + 1, lastReason: reason });
  return { deny: `Secret Sentry blocked write (${reason}). Use env vars / secret manager instead of plaintext credentials.` };
}
export function register(on) {
  on("session.start", async ($, e, next) => {
    const r = await next(e);
    await $.state.set(HITS, { blocked: 0 });
    return r;
  });
  on("tool.call", { tool: "Write" }, guardWrite);
  on("tool.call", { tool: "Edit" }, guardWrite);
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props?.hasSurvey) return next(e);
    const { value: hits } = await $.state.get(HITS);
    if (!hits?.blocked) return next(e);
    const { Box, Text } = $.ui.resolve(e);
    return Box({ paddingX: 1, children: [Text({ color: "red", bold: true, children: `SECRET-SENTRY blocked:${hits.blocked}` })] });
  });
}
