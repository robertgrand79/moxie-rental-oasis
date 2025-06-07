
export const getDefaultPages = (userId: string) => [
  {
    title: 'Home',
    slug: '',
    content: 'Welcome to our real estate platform featuring premium properties in Eugene, Oregon.',
    meta_description: 'Premium real estate properties and rentals in Eugene, Oregon',
    is_published: true,
    created_by: userId
  },
  {
    title: 'Listings',
    slug: 'listings',
    content: 'Browse our collection of available properties for rent and sale.',
    meta_description: 'Property listings for rent and sale in Eugene, Oregon',
    is_published: true,
    created_by: userId
  },
  {
    title: 'Blog',
    slug: 'blog',
    content: 'Read our latest articles about real estate, local news, and property insights.',
    meta_description: 'Real estate blog with insights and local Eugene news',
    is_published: true,
    created_by: userId
  },
  {
    title: 'About',
    slug: 'about',
    content: 'Learn more about our company and commitment to providing exceptional real estate services.',
    meta_description: 'About our real estate company and services',
    is_published: true,
    created_by: userId
  },
  {
    title: 'Experiences',
    slug: 'experiences',
    content: 'Discover unique local experiences and activities in Eugene, Oregon.',
    meta_description: 'Local experiences and activities in Eugene, Oregon',
    is_published: true,
    created_by: userId
  },
  {
    title: 'FAQ',
    slug: 'faq',
    content: 'Frequently asked questions about our services and properties.',
    meta_description: 'Frequently asked questions about our real estate services',
    is_published: true,
    created_by: userId
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: 'Our privacy policy and data protection practices.',
    meta_description: 'Privacy policy and data protection information',
    is_published: true,
    created_by: userId
  },
  {
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: 'Terms and conditions for using our services.',
    meta_description: 'Terms of service and usage conditions',
    is_published: true,
    created_by: userId
  },
  {
    title: 'Search Results',
    slug: 'search',
    content: 'Search results for properties and content.',
    meta_description: 'Search results page for finding properties and content',
    is_published: true,
    created_by: userId
  },
  // Property pages (hardcoded for existing routes)
  {
    title: 'Harris Street Property',
    slug: 'property/harris-st',
    content: 'Beautiful property located on Harris Street in Eugene, Oregon.',
    meta_description: 'Harris Street property rental in Eugene, Oregon',
    is_published: true,
    created_by: userId
  },
  {
    title: 'Kincaid Street Property',
    slug: 'property/kincaid-st',
    content: 'Charming property located on Kincaid Street in Eugene, Oregon.',
    meta_description: 'Kincaid Street property rental in Eugene, Oregon',
    is_published: true,
    created_by: userId
  },
  {
    title: 'W 10th House',
    slug: 'property/w-10th-house',
    content: 'Spacious house located on W 10th Avenue in Eugene, Oregon.',
    meta_description: 'W 10th Avenue house rental in Eugene, Oregon',
    is_published: true,
    created_by: userId
  },
  {
    title: 'W 10th Studio',
    slug: 'property/w-10th-studio',
    content: 'Cozy studio apartment located on W 10th Avenue in Eugene, Oregon.',
    meta_description: 'W 10th Avenue studio rental in Eugene, Oregon',
    is_published: true,
    created_by: userId
  },
  {
    title: 'Woodlawn Avenue Property',
    slug: 'property/woodlawn-ave',
    content: 'Lovely property located on Woodlawn Avenue in Eugene, Oregon.',
    meta_description: 'Woodlawn Avenue property rental in Eugene, Oregon',
    is_published: true,
    created_by: userId
  },
  // Admin pages
  {
    title: 'Admin Dashboard',
    slug: 'admin',
    content: 'Administrative dashboard for managing the website.',
    meta_description: 'Admin dashboard for website management',
    is_published: false,
    created_by: userId
  },
  {
    title: 'Properties Management',
    slug: 'properties',
    content: 'Manage property listings and details.',
    meta_description: 'Property management interface for administrators',
    is_published: false,
    created_by: userId
  },
  {
    title: 'Page Management',
    slug: 'page-management',
    content: 'Manage website pages and content.',
    meta_description: 'Page management interface for administrators',
    is_published: false,
    created_by: userId
  },
  {
    title: 'Blog Management',
    slug: 'blog-management',
    content: 'Manage blog posts and articles.',
    meta_description: 'Blog management interface for administrators',
    is_published: false,
    created_by: userId
  },
  {
    title: 'Site Settings',
    slug: 'site-settings',
    content: 'Configure website settings and preferences.',
    meta_description: 'Site configuration and settings page',
    is_published: false,
    created_by: userId
  },
  {
    title: 'Admin Profile',
    slug: 'admin/profile',
    content: 'Administrator profile and account settings.',
    meta_description: 'Admin profile and account management',
    is_published: false,
    created_by: userId
  }
];
