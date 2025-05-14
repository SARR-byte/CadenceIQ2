import OpenAI from 'openai';
import { supabase } from './supabase';
import { logAPIRequest, checkRateLimit } from './api';
import type { User } from '@supabase/supabase-js';

let openaiInstance: OpenAI | null = null;

async function getOpenAIKey(): Promise<string> {
  const { data, error } = await supabase
    .from('secrets')
    .select('value')
    .eq('key', 'OPENAI_API_KEY')
    .single();

  if (error) {
    throw new Error('Failed to retrieve OpenAI API key');
  }

  return data.value;
}

export async function getOpenAIClient(user: User): Promise<OpenAI> {
  if (!openaiInstance) {
    const apiKey = await getOpenAIKey();
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export async function generateCompletion(
  user: User,
  prompt: string,
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const withinLimit = await checkRateLimit(user, 'openai');
  if (!withinLimit) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const startTime = Date.now();
  try {
    const openai = await getOpenAIClient(user);
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      max_tokens: options.maxTokens ?? 150,
      temperature: options.temperature ?? 0.7,
    });

    const duration = Date.now() - startTime;
    await logAPIRequest(user, {
      service: 'openai',
      endpoint: '/v1/chat/completions',
      statusCode: 200,
      durationMs: duration,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    const duration = Date.now() - startTime;
    await logAPIRequest(user, {
      service: 'openai',
      endpoint: '/v1/chat/completions',
      statusCode: error instanceof Error ? 500 : 400,
      durationMs: duration,
    });
    throw error;
  }
}

export async function generateEmbedding(
  user: User,
  text: string
): Promise<number[]> {
  const withinLimit = await checkRateLimit(user, 'openai');
  if (!withinLimit) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const startTime = Date.now();
  try {
    const openai = await getOpenAIClient(user);
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    const duration = Date.now() - startTime;
    await logAPIRequest(user, {
      service: 'openai',
      endpoint: '/v1/embeddings',
      statusCode: 200,
      durationMs: duration,
    });

    return response.data[0].embedding;
  } catch (error) {
    const duration = Date.now() - startTime;
    await logAPIRequest(user, {
      service: 'openai',
      endpoint: '/v1/embeddings',
      statusCode: error instanceof Error ? 500 : 400,
      durationMs: duration,
    });
    throw error;
  }
}