
// OpenAI API configuration and request handling

export const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function generateContentWithOpenAI(
  systemPrompt: string, 
  userPrompt: string, 
  maxTokens: number = 500
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

export function getMaxTokensForCategory(category: string): number {
  switch (category) {
    case 'newsletter':
      return 2000;
    case 'pages':
      return 1500;
    case 'blog':
      return 2000;
    default:
      return 500;
  }
}
