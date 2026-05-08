export const getAuthRedirectOrigin = (): string => {
  if (typeof window === 'undefined') {
    return 'https://staymoxie.com';
  }

  const { origin, hostname, protocol, port } = window.location;

  // Supabase redirect allow-lists are typically configured for the canonical apex domain.
  // Keep non-production origins untouched so local dev and previews continue to work.
  if (hostname === 'www.staymoxie.com') {
    return `${protocol}//staymoxie.com${port ? `:${port}` : ''}`;
  }

  return origin;
};
