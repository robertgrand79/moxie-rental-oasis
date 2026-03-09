/**
 * Comprehensive default settings for tenant-facing (public) site_settings keys.
 * Used by useTenantSettings to soft-patch missing keys so the UI never hits undefined.
 *
 * ⚠️  Keep this file in sync with every key the admin settings panels can write.
 *     When you add a new setting key anywhere in the UI, add it here too.
 */

export const defaultTenantSettings: Record<string, string> = {
  // ── Branding ──────────────────────────────────────────
  siteName: '',
  siteLogo: '',
  site_name: 'My Rentals',
  logo_url: '',
  logoUrl: '',
  favicon_url: '',
  tagline: '',
  description: '',
  site_description: '',

  // ── Hero ──────────────────────────────────────────────
  heroTitle: 'Welcome to our properties',
  hero_title: 'Welcome to our properties',
  heroSubtitle: '',
  hero_subtitle: '',
  heroDescription: '',
  heroBackgroundImage: '',
  hero_image_url: '',
  heroLocationText: '',
  hero_location_text: '',
  heroCTAText: 'View Properties',

  // ── Contact ───────────────────────────────────────────
  contactEmail: '',
  contact_email: '',
  phone: '',
  contact_phone: '',
  address: '',
  social_facebook: '',
  social_instagram: '',
  social_twitter: '',
  social_googlePlaces: '',

  // ── SEO ───────────────────────────────────────────────
  siteTitle: '',
  metaDescription: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  favicon: '',
  keywords: '',
  canonicalBase: '',
  twitterCardType: 'summary_large_image',
  twitterSite: '',

  // ── Analytics ─────────────────────────────────────────
  googleAnalyticsId: '',
  googleTagManagerId: '',
  facebookPixelId: '',
  customHeaderScripts: '',
  customFooterScripts: '',
  customCss: '',

  // ── Maps ──────────────────────────────────────────────
  mapboxToken: '',

  // ── Typography ────────────────────────────────────────
  fontPairing: 'playfair-source',
  fontScale: 'default',

  // ── Email styling ─────────────────────────────────────
  emailFromAddress: '',
  emailFromName: '',
  emailReplyTo: '',
  emailHeaderColor: '#3b82f6',
  emailHeaderColorEnd: '#1d4ed8',
  emailAccentColor: '#3b82f6',
  emailFooterColor: '#f8fafc',
  emailSetupVerified: 'false',

  // ── About page ────────────────────────────────────────
  aboutTitle: '',
  aboutDescription: '',
  aboutImageUrl: '',
  founderNames: '',
  missionStatement: '',
  missionDescription: '',
  aboutHeroSubtitle: "We're passionate about creating unforgettable vacation experiences through carefully curated properties in beautiful destinations.",
  aboutFeatureCards: JSON.stringify([
    { icon: 'Home', title: 'Local Expertise', description: 'Deep knowledge of our area with insight into every hidden gem' },
    { icon: 'Award', title: 'Quality Focus', description: 'Every property carefully curated and maintained' },
    { icon: 'Heart', title: 'Passionate Hosts', description: 'Genuine love for hospitality and exceptional service' },
    { icon: 'Star', title: 'Family Values', description: 'Family-owned business creating memorable experiences' },
  ]),
  aboutFounderQuote: 'We believe in creating spaces where families can come together, where memories are made, and where the beauty of your destination becomes part of your story.',
  aboutTagline: 'Your local ambassadors to exceptional vacation experiences',
  aboutTags: 'Local,Trusted,Quality,Family',
  aboutMissionCards: JSON.stringify([
    { icon: "Mountain", title: "Outdoor Adventures", description: "From hiking trails to scenic views, we'll guide you to the most breathtaking outdoor experiences and hidden natural gems." },
    { icon: "Coffee", title: "Culinary Delights", description: "Discover the vibrant food scene, from artisan coffee shops to farm-to-table restaurants and local breweries that define regional cuisine." },
  ]),
  aboutValuesCards: JSON.stringify([
    { icon: 'CheckCircle', title: 'Integrity First', description: 'We prioritize unwavering honesty, transparency, and ethical practices in all aspects of our business.' },
    { icon: 'Zap', title: 'Fast Action Experience', description: 'We provide swift and efficient solutions while ensuring a seamless and enjoyable experience for our guests.' },
    { icon: 'Star', title: 'Undisputable Value', description: 'We provide unparalleled experiences that are unmatched in the industry, ensuring exceptional value.' },
    { icon: 'HandHeart', title: 'People Over Profits', description: 'We prioritize the well-being, satisfaction, and success of our guests and communities above all financial considerations.' },
  ]),
  aboutExcellenceTitle: 'Excellence',
  aboutExcellenceDescription: 'We strive for excellence in every aspect of our business, from the meticulously maintained properties to the curated experiences we provide.',
  aboutAuthenticityTitle: 'Authenticity',
  aboutAuthenticityDescription: 'We believe in showcasing the true essence of the area. From recommending local dining experiences to offering outdoor activities, we provide an authentic and immersive experience.',
  aboutClosingQuote: 'Immerse yourself in the wonders of the area and indulge in the comfort, style, and hospitality that we offer.',

  // ── Home page sections ────────────────────────────────
  propertiesSectionTitle: '',
  propertiesSectionDescription: '',
  testimonialsSectionDescription: '',
  amenitiesSectionTitle: 'Premium Amenities',
  amenitiesSectionDescription: 'Our properties come thoughtfully equipped with everything you need for a comfortable stay',
  amenitiesSectionEnabled: 'true',
  lifestyleSectionTitle: '',
  lifestyleSectionDescription: '',
  finalFeatureSectionTitle: '',
  finalFeature1Title: '',
  finalFeature1Description: '',
  finalFeature2Title: '',
  finalFeature2Description: '',
  finalFeature3Title: '',
  finalFeature3Description: '',
  newsletterTitle: '',
  newsletterDescription: '',

  // ── Blog ──────────────────────────────────────────────
  blogTitle: '',
  blogDescription: '',

  // ── Colors ────────────────────────────────────────────
  colorPrimary: '#000000',
  colorSecondary: '#8b929a',
  colorAccent: '#cbcfd2',
  colorBackground: '#ffffff',
  colorForeground: '#1a202c',
  colorMuted: '#ececec',
  colorDestructive: '#ef4444',
  colorUseGradients: 'true',

  // ── Owner Travels ─────────────────────────────────────
  ownerTravelsTitle: '',
  ownerTravelsDescription: '',
  ownerTravelsImageUrl: '',
  ownerTravelsEnabled: 'true',

  // ── Video & Social Feeds ──────────────────────────────
  youtubeVideoUrl: '',
  tiktokProfileUrl: '',
  instagramFeedUrl: '',

  // ── Assistant / Chat Widget ───────────────────────────
  assistant_bubble_color: '#3b82f6',
  assistant_display_name: 'Virtual Assistant',
  assistant_welcome_message: 'Hi there! How can I help you today?',
  assistant_personality: '',
  assistant_is_enabled: 'true',
  assistant_text_color: '#ffffff',
  assistant_message_bg_color: '',
  assistant_header_text_color: '#ffffff',
  assistant_quick_action_text_color: '',
  assistant_submit_button_color: '',
  assistant_user_message_text_color: '#ffffff',
  assistant_welcome_title_color: '',
  assistant_welcome_subtitle_color: '',
  assistant_chat_style: 'modern',
  assistant_avatar_type: 'default',
  assistant_custom_avatar_url: '',
  assistant_avatar_background_color: '',
  assistant_avatar_background_color_end: '',
  assistant_use_custom_avatar: 'false',

  // ── TV / Signage Mode ─────────────────────────────────
  tv_welcome_message: 'Welcome to your stay',
  tv_chat_enabled: 'true',
  tv_show_avatar: 'true',
  tv_signage_rotation_seconds: '10',

  // ── Footer ────────────────────────────────────────────
  footer_text: '',

  // ── Booking / Reservation defaults ────────────────────
  default_check_in_time: '15:00',
  default_check_out_time: '11:00',
  currency: 'USD',
  timezone: 'America/New_York',

  // ── Notifications ─────────────────────────────────────
  notification_email_enabled: 'true',
  notification_sms_enabled: 'false',
};
