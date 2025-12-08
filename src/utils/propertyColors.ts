// Dynamic property color palette - colors are assigned based on property ID hash
const COLOR_PALETTE = [
  { bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-700' },
  { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-700' },
  { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-700' },
  { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-700' },
  { bg: 'bg-violet-600', text: 'text-white', border: 'border-violet-700' },
  { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700' },
  { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
  { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-700' },
  { bg: 'bg-cyan-600', text: 'text-white', border: 'border-cyan-700' },
  { bg: 'bg-pink-600', text: 'text-white', border: 'border-pink-700' },
];

// Fallback color for any edge cases
export const DEFAULT_PROPERTY_COLOR = { 
  bg: 'bg-slate-500', text: 'text-white', border: 'border-slate-600', name: 'Unknown Property'
};

// Hash function to deterministically assign a color based on property ID
const hashPropertyId = (propertyId: string): number => {
  return propertyId.slice(0, 8).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

// Get a consistent color for a property based on its ID
export const getPropertyColor = (propertyId: string, propertyName?: string) => {
  if (!propertyId) return DEFAULT_PROPERTY_COLOR;
  
  const colorIndex = hashPropertyId(propertyId) % COLOR_PALETTE.length;
  return {
    ...COLOR_PALETTE[colorIndex],
    name: propertyName || 'Property'
  };
};

// Generate property colors for a list of properties (for legends)
export const getPropertyColorsForList = (properties: { id: string; title: string }[]) => {
  return properties.map(property => ({
    id: property.id,
    ...getPropertyColor(property.id, property.title)
  }));
};
