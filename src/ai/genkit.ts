// AI engine removed — prototype mode. AI actions return mock responses from actions/ai.ts.

export function getGroq() {
  return {
    chat: {
      completions: {
        create: async (_opts?: any) => ({
          choices: [{ message: { content: '{}' } }],
        }),
      },
    },
  };
}
