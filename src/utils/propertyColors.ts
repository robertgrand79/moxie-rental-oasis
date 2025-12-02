// Property color palette - each property gets a unique, visually distinct color
export const PROPERTY_COLORS: Record<string, { bg: string; text: string; border: string; name: string }> = {
  'a8a54056-a9e2-4d8e-b3ae-cf059cf59d17': { // Moxie 10th St. House
    bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-700', name: 'Moxie 10th St. House'
  },
  '85de8d36-5b40-45b1-acf4-79afe627b50a': { // Moxie 10th St. Studio
    bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-700', name: 'Moxie 10th St. Studio'
  },
  '4fe1f5e4-d4fd-45aa-a802-84f1d939669c': { // Moxie Harris Bungalow
    bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-700', name: 'Moxie Harris Bungalow'
  },
  '59e6d5f8-65b1-4ab0-8709-18efc011a60c': { // Moxie Kincaid House
    bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-700', name: 'Moxie Kincaid House'
  },
  '5b1b70aa-8fad-464b-876b-b48ced8fc683': { // Moxie Nixon Campus Bungalow
    bg: 'bg-violet-600', text: 'text-white', border: 'border-violet-700', name: 'Moxie Nixon Campus Bungalow'
  },
};

// Fallback color for any new properties
export const DEFAULT_PROPERTY_COLOR = { 
  bg: 'bg-slate-500', text: 'text-white', border: 'border-slate-600', name: 'Unknown Property'
};

export const getPropertyColor = (propertyId: string) => {
  return PROPERTY_COLORS[propertyId] || DEFAULT_PROPERTY_COLOR;
};

// Get all property colors for legend display
export const getAllPropertyColors = () => {
  return Object.entries(PROPERTY_COLORS).map(([id, colors]) => ({
    id,
    ...colors
  }));
};
