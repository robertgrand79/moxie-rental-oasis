
import { SettingsState } from './types';

export const defaultSettings: SettingsState = {
  siteName: '',
  siteLogo: '',
  tagline: '',
  description: '',
  heroTitle: '',
  heroSubtitle: '',
  heroDescription: '',
  heroBackgroundImage: '',
  heroLocationText: '',
  heroCTAText: 'View Properties',
  contactEmail: '',
  phone: '',
  address: '',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    googlePlaces: ''
  },
  emailFromAddress: '',
  emailFromName: '',
  emailReplyTo: '',
  emailSetupVerified: false,
  emailLastTestedAt: null,
  emailVerificationDetails: null,
  siteTitle: '',
  metaDescription: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  favicon: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  facebookPixelId: '',
  customHeaderScripts: '',
  customFooterScripts: '',
  customCss: '',
  mapboxToken: '',
  fontPairing: 'playfair-source',
  fontScale: 'default',
  // Email Styling
  emailHeaderColor: '#3b82f6',
  emailHeaderColorEnd: '#1d4ed8',
  emailAccentColor: '#3b82f6',
  emailFooterColor: '#f8fafc',
  // About page - Basic
  aboutTitle: '',
  aboutDescription: '',
  aboutImageUrl: '',
  founderNames: '',
  missionStatement: '',
  missionDescription: '',
  
  // About page - Extended customization
  aboutHeroSubtitle: "We're passionate about creating unforgettable vacation experiences through carefully curated properties in beautiful destinations.",
  aboutFeatureCards: JSON.stringify([
    { icon: "Home", title: "Local Expertise", description: "Deep knowledge of our area with insight into every hidden gem" },
    { icon: "Award", title: "Quality Focus", description: "Every property carefully curated and maintained" },
    { icon: "Heart", title: "Passionate Hosts", description: "Genuine love for hospitality and exceptional service" },
    { icon: "Star", title: "Family Values", description: "Family-owned business creating memorable experiences" }
  ]),
  aboutFounderQuote: "We believe in creating spaces where families can come together, where memories are made, and where the beauty of your destination becomes part of your story.",
  aboutTagline: "Your local ambassadors to exceptional vacation experiences",
  aboutTags: "Local,Trusted,Quality,Family",
  aboutMissionCards: JSON.stringify([
    { icon: "Mountain", title: "Outdoor Adventures", description: "From hiking trails to scenic views, we'll guide you to the most breathtaking outdoor experiences and hidden natural gems." },
    { icon: "Coffee", title: "Culinary Delights", description: "Discover the vibrant food scene, from artisan coffee shops to farm-to-table restaurants and local breweries that define regional cuisine." }
  ]),
  aboutValuesCards: JSON.stringify([
    { icon: "CheckCircle", title: "Integrity First", description: "We prioritize unwavering honesty, transparency, and ethical practices in all aspects of our business." },
    { icon: "Zap", title: "Fast Action Experience", description: "We provide swift and efficient solutions while ensuring a seamless and enjoyable experience for our guests." },
    { icon: "Star", title: "Undisputable Value", description: "We provide unparalleled experiences that are unmatched in the industry, ensuring exceptional value." },
    { icon: "HandHeart", title: "People Over Profits", description: "We prioritize the well-being, satisfaction, and success of our guests and communities above all financial considerations." }
  ]),
  aboutExcellenceTitle: "Excellence",
  aboutExcellenceDescription: "We strive for excellence in every aspect of our business, from the meticulously maintained properties to the curated experiences we provide. We go above and beyond to ensure that our guests have an unforgettable stay.",
  aboutAuthenticityTitle: "Authenticity",
  aboutAuthenticityDescription: "We believe in showcasing the true essence of the area. From recommending local dining experiences to offering outdoor activities, we provide an authentic and immersive experience that allows guests to truly connect with the beauty and culture of the region.",
  aboutClosingQuote: "Immerse yourself in the wonders of the area and indulge in the comfort, style, and hospitality that we offer, guided by the expertise of our passionate team.",
  // Amenities section
  amenitiesSectionTitle: 'Premium Amenities',
  amenitiesSectionDescription: 'Our properties come thoughtfully equipped with everything you need for a comfortable stay',
  amenitiesSectionEnabled: true,
  
  // Site Colors (stored as hex)
  colorPrimary: '#767b8d',
  colorSecondary: '#8b929a',
  colorAccent: '#cbcfd2',
  colorBackground: '#ffffff',
  colorForeground: '#1a202c',
  colorMuted: '#ececec',
  colorDestructive: '#ef4444',
  
  // Color mode settings
  colorUseGradients: true
};
