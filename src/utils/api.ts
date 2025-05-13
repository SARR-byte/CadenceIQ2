import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
}

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

const generateProfilePrompt = (urls: { linkedin?: string, facebook?: string }) => {
  let prompt = 'Based on the following social media profiles:\n\n';
  
  if (urls.linkedin) {
    prompt += `LinkedIn: ${urls.linkedin}\n`;
  }
  if (urls.facebook) {
    prompt += `Facebook: ${urls.facebook}\n`;
  }
  
  prompt += `\nProvide a detailed analysis in JSON format with the following structure:
  {
    "companyInfo": {
      "founded": "string",
      "milestones": ["string"],
      "awards": ["string"],
      "recentNews": ["string"],
      "offerings": ["string"],
      "culture": ["string"]
    },
    "personalInfo": {
      "career": ["string"],
      "education": ["string"],
      "interests": ["string"],
      "publications": ["string"],
      "causes": ["string"],
      "recentActivity": ["string"],
      "achievements": ["string"]
    }
  }`;

  return prompt;
};

export const generateInsights = async (urls: { linkedin?: string, facebook?: string }) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: generateProfilePrompt(urls)
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
};

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