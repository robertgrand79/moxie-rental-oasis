// Lovable AI Gateway configuration and request handling

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

export async function generateContentWithAI(
  systemPrompt: string, 
  userPrompt: string, 
  maxTokens: number = 500
): Promise<string> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
    }),
  });

  if (response.status === 429) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  if (response.status === 402) {
    throw new Error('AI credits exhausted. Please contact support.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI Gateway error:', response.status, errorText);
    throw new Error(`AI Gateway error: ${response.status}`);
  }

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
