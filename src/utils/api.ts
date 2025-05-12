import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
}

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

// Verify API key is working
export const verifyApiKey = async () => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Test" }],
    });
    return response.choices.length > 0;
  } catch (error) {
    console.error('OpenAI API key verification failed:', error);
    throw error;
  }
};