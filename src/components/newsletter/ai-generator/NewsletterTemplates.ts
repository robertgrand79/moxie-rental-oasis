
import React from 'react';
import { Calendar, MapPin, Home, Star } from 'lucide-react';

export interface NewsletterTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'weekly' | 'property' | 'events' | 'seasonal';
  icon: React.ReactNode;
}

export const newsletterTemplates: NewsletterTemplate[] = [
  {
    id: 'weekly-digest',
    title: 'Weekly Local Digest',
    description: 'Curated local events and attractions for guests',
    category: 'weekly',
    icon: <Calendar className="h-4 w-4" />,
    prompt: `Create a visually engaging weekly newsletter for Moxie Vacation Rentals guests featuring:

**Structure the content with clear sections:**

**Welcome Section:**
- Warm greeting for new and returning guests to Eugene
- Brief overview of this week's highlights

**Local Attractions This Week:**
- 3-4 must-visit Eugene attractions with brief descriptions
- Include why each is special and perfect for vacation rental guests

**Upcoming Events:**
- 2-3 exciting events happening in Eugene this week
- Include dates, times, and what makes each event unique

**Hidden Gem Spotlight:**
- Feature one lesser-known local secret or experience
- Explain why locals love it and how to find it

**Weather & Packing Tips:**
- Current weather forecast for Eugene
- Practical packing suggestions for activities

**Dining Recommendations:**
- 2-3 local restaurant or food experience highlights
- Mix of casual and special occasion options

**Call to Action:**
- Encourage guests to book or extend stays
- Mention available properties for immediate booking

**Style Guidelines:**
- Use warm, welcoming, and locally-focused tone
- Write in short, scannable paragraphs
- Include specific Eugene location names and details
- Create excitement about exploring the area
- Format with clear headings and bullet points where appropriate`
  },
  {
    id: 'property-spotlight',
    title: 'Property Spotlight',
    description: 'Showcase a specific property with local context',
    category: 'property',
    icon: <Home className="h-4 w-4" />,
    prompt: `Create a property spotlight newsletter for Moxie Vacation Rentals featuring:

**Structure with clear sections:**

**Hero Property Showcase:**
- Feature one of our premium properties with compelling description
- Highlight unique amenities and special features
- Include property capacity and ideal guest types

**What Makes This Property Special:**
- Detailed description of standout features
- Interior highlights and comfort elements
- Unique aspects that differentiate it from other rentals

**Perfect Location Benefits:**
- Nearby attractions within walking/short driving distance
- Local restaurants, shops, and entertainment options
- Transportation and accessibility advantages

**Ideal Guest Experiences:**
- Perfect scenarios: couples' getaways, family vacations, business travelers
- Specific activities and experiences available from this location
- How the property enhances their Eugene experience

**Guest Love Stories:**
- Include a compelling guest testimonial or review highlight
- Specific details about what guests enjoyed most
- Real examples of memorable experiences

**Seasonal Activities:**
- Current season activities accessible from this property
- Outdoor adventures and indoor comforts available
- Local events and experiences nearby

**Booking Incentive:**
- Special offer or exclusive package for this property
- Limited-time promotions or value-adds
- Easy booking information and next steps

**Explore More Options:**
- Cross-sell other properties for different experiences
- Mention variety in our portfolio
- Encourage exploration of all Moxie offerings

**Style Guidelines:**
- Aspirational and detailed writing style
- Help readers envision their perfect Eugene getaway
- Use specific details and vivid descriptions
- Include practical information with inspirational content`
  },
  {
    id: 'seasonal-guide',
    title: 'Seasonal Eugene Guide',
    description: 'Seasonal activities and experiences guide',
    category: 'seasonal',
    icon: <MapPin className="h-4 w-4" />,
    prompt: `Create a comprehensive seasonal guide newsletter for Moxie Vacation Rentals featuring:

**Current Season Highlights:**
- What makes this season special in Eugene, Oregon
- Unique opportunities only available during this time
- Why now is the perfect time to visit

**Top Seasonal Activities:**
- 5 must-do seasonal activities and experiences
- Mix of outdoor adventures and cultural experiences
- Include difficulty levels and duration for each

**Local Festivals & Events:**
- Major seasonal festivals and community events
- Smaller, authentic local gatherings worth attending
- How to participate and what to expect

**Weather & Preparation Guide:**
- Detailed weather expectations for the season
- Essential packing checklist for Eugene visitors
- Tips for making the most of current conditions

**Seasonal Dining & Local Flavors:**
- Seasonal specialties at local restaurants
- Farmers market highlights and seasonal produce
- Food festivals and culinary events happening now

**Outdoor Adventure Guide:**
- Best hiking trails and outdoor activities for the season
- Parks and natural areas at their seasonal peak
- Equipment recommendations and safety tips

**Photography & Instagram Spots:**
- Most beautiful locations for seasonal photography
- Best times of day for stunning shots
- Hidden spots that showcase Eugene's seasonal beauty

**Exclusive Seasonal Packages:**
- Special seasonal rates and package deals
- Properties that offer the best seasonal experiences
- Limited-time offers that enhance the seasonal experience

**Local Insider Tips:**
- Secrets that only Eugene locals know about this season
- Best times to visit popular spots to avoid crowds
- Free or budget-friendly seasonal activities

**Style Guidelines:**
- Informative and inspiring tone
- Position Moxie as the local expert for seasonal Eugene experiences
- Use specific seasonal details and current information
- Include practical tips with inspirational content
- Write in an enthusiastic but knowledgeable voice`
  },
  {
    id: 'guest-story',
    title: 'Guest Story & Reviews',
    description: 'Feature guest experiences and testimonials',
    category: 'weekly',
    icon: <Star className="h-4 w-4" />,
    prompt: `Create an engaging guest story newsletter for Moxie Vacation Rentals featuring:

**Featured Guest Experience:**
- Compelling guest story from a recent stay
- What brought them to Eugene and why they chose Moxie
- Timeline of their visit with highlights

**Property Experience Highlights:**
- Which property they stayed in and why it was perfect
- Specific amenities and features they loved most
- How the property enhanced their Eugene experience

**Local Discoveries:**
- Unique local places they discovered during their visit
- Restaurants, attractions, or experiences they recommend
- Hidden gems they found with our local guidance

**Memorable Moments:**
- Specific experiences that made their stay special
- Unexpected discoveries or delightful surprises
- How their Eugene experience exceeded expectations

**Guest Recommendations:**
- What they suggest other visitors should not miss
- Tips and advice for future Moxie guests
- Best times to visit or special considerations

**Photo Highlights:**
- Description of photos from their experience (note: we'll add placeholders)
- Scenic spots they captured during their stay
- Property features they photographed and loved

**Travel Style Insights:**
- What type of travelers they are (adventure, relaxation, culture, etc.)
- How Moxie properties matched their travel preferences
- Why they chose vacation rentals over hotels

**Similar Experiences Available:**
- How other guests can have comparable experiences
- Properties and packages that offer similar benefits
- Seasonal considerations for recreating their experience

**Community Building:**
- Invitation for other guests to share their stories
- How to connect with us during and after stays
- Social media encouragement and hashtag suggestions

**Booking Inspiration:**
- Call-to-action encouraging similar bookings
- Properties that offer comparable experiences
- Special offers for guests seeking similar adventures

**Style Guidelines:**
- Personal and authentic storytelling approach
- Showcase real guest experiences to inspire future visitors
- Use specific details and genuine enthusiasm
- Balance personal story with practical information for potential guests
- Create emotional connection while providing useful insights`
  },
  {
    id: 'events-roundup',
    title: 'Eugene Events Roundup',
    description: 'Comprehensive local events and activities',
    category: 'events',
    icon: <Calendar className="h-4 w-4" />,
    prompt: `Create a comprehensive events roundup newsletter for Moxie Vacation Rentals featuring:

**This Month's Signature Events:**
- Top 3-4 can't-miss events happening in Eugene this month
- Include dates, times, locations, and ticket information
- Explain why each event is special and worth attending

**Arts & Culture Happenings:**
- Art gallery openings and exhibitions
- Theater performances and live music venues
- Cultural festivals and community celebrations
- Museum special exhibitions and programs

**Food & Drink Events:**
- Farmers markets and their seasonal specialties
- Food festivals and restaurant special events
- Wine tastings and brewery events
- Cooking classes and culinary experiences

**Outdoor Recreation Opportunities:**
- Guided tours and outdoor adventure events
- Seasonal hiking and nature programs
- Sports events and recreational activities
- Community fitness and wellness events

**Family-Friendly Activities:**
- Events perfect for families with children
- Educational programs and interactive experiences
- Seasonal activities kids will love
- Free family entertainment options

**Date Night & Romance:**
- Perfect events for couples and romantic evenings
- Fine dining special events and wine experiences
- Cultural performances ideal for date nights
- Unique Eugene experiences for couples

**Budget-Friendly & Free Activities:**
- Completely free events and entertainment
- Low-cost community activities and programs
- Public festivals and celebrations
- Self-guided tours and free attractions

**Seasonal Celebrations:**
- Holiday and seasonal community events
- Traditional Eugene celebrations and festivals
- Weather-dependent activities and backup plans
- Special seasonal markets and pop-ups

**Booking Connections:**
- How to plan stays that align with major events
- Properties with the best access to event venues
- Package deals that include event experiences
- Advance booking recommendations for event weekends

**Local Insider Access:**
- VIP experiences or behind-the-scenes opportunities
- How to get the best tickets or avoid crowds
- Local secrets for enjoying events like a Eugene resident
- Transportation tips and parking advice

**Style Guidelines:**
- Comprehensive and exciting tone
- Position our properties as the perfect base for experiencing Eugene's vibrant event scene
- Include practical details alongside inspirational content
- Use enthusiastic but informative language
- Organize information clearly for easy scanning and planning`
  }
];

export const quickPrompts = [
  "Create a warm welcome newsletter highlighting Eugene's charm for first-time visitors with local recommendations",
  "Write about Eugene's best-kept secrets and hidden gems that only locals know about",
  "Feature this weekend's top events in Eugene with insider tips for the best experience", 
  "Highlight family-friendly outdoor activities and attractions perfect for vacation rental guests",
  "Showcase Eugene's vibrant food and dining scene with must-try restaurants and experiences",
  "Create a romantic getaway guide for couples featuring intimate experiences in Eugene"
];
