import { expect, test } from 'bun:test';
import { buildAiCodeMirrorRaw } from '@/features/providers/aiCodeMirror';

test('AIcodeMirror cannot claim connections with no explicit endpoint', () => {
  const key = { apiKey: 'fixture' };
  expect(
    buildAiCodeMirrorRaw({
      openaiCompatibility: [{ name: 'Example', baseUrl: '', apiKeyEntries: [key] }],
      claudeApiKeys: [key],
      codexApiKeys: [key],
      geminiApiKeys: [key],
    })
  ).toEqual({ openai: [], claude: [], codex: [], gemini: [] });
});
