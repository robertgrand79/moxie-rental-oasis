
export const generateAddressSlug = (location: string, includePropertyId?: string): string => {
  // Convert location to URL-friendly slug
  const baseSlug = location
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Only add property ID suffix if explicitly requested (for backward compatibility)
  return includePropertyId ? `${baseSlug}-${includePropertyId.slice(0, 8)}` : baseSlug;
};

export const parseAddressSlug = (slug: string): { location: string; propertyId?: string } => {
  // Check if slug contains property ID (8 character suffix)
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  if (lastPart && lastPart.length === 8 && /^[a-f0-9]{8}$/.test(lastPart)) {
    // Has property ID suffix - backward compatibility
    const location = parts.slice(0, -1).join('-').replace(/-/g, ' ');
    return { location, propertyId: lastPart };
  }
  
  // No property ID suffix - clean address slug
  const location = slug.replace(/-/g, ' ');
  return { location };
};
