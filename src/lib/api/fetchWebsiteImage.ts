import { supabase } from '@/integrations/supabase/client';

export async function fetchWebsiteImage(websiteUrl: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('fetch-website-image', {
    body: { websiteUrl },
  });

  if (error) {
    throw new Error(error.message || 'Failed to fetch image from website');
  }

  if (!data.success || !data.imageUrl) {
    throw new Error(data.error || 'No image found on the website');
  }

  return data.imageUrl;
}
