
export const generateAddressSlug = (location: string, propertyId?: string): string => {
  // Convert location to URL-friendly slug
  const baseSlug = location
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Add property ID suffix for uniqueness if provided
  return propertyId ? `${baseSlug}-${propertyId.slice(0, 8)}` : baseSlug;
};

export const parseAddressSlug = (slug: string): { location: string; propertyId?: string } => {
  // Check if slug contains property ID (8 character suffix)
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  if (lastPart && lastPart.length === 8 && /^[a-f0-9]{8}$/.test(lastPart)) {
    // Has property ID suffix
    const location = parts.slice(0, -1).join('-').replace(/-/g, ' ');
    return { location, propertyId: lastPart };
  }
  
  // No property ID suffix
  const location = slug.replace(/-/g, ' ');
  return { location };
};
