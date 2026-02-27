import { config } from 'dotenv';
config();

import '@/ai/flows/ai-summarize-post-flow.ts';
import '@/ai/flows/ai-suggest-hashtags-flow.ts';
import '@/ai/flows/ai-translate-post-flow.ts';
import '@/ai/flows/ai-generate-mixes-flow.ts';
import '@/ai/flows/ai-generate-verification-code-flow.ts';
import '@/ai/flows/ai-summarize-comments-flow.ts';
