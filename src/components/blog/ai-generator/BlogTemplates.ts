
export interface BlogTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'travel' | 'local' | 'property' | 'guest' | 'seasonal';
  icon: string;
  estimatedReadTime: string;
}

export const blogTemplates: BlogTemplate[] = [
  {
    id: 'travel-story',
    title: 'Travel Adventure Story',
    description: 'Engaging narrative about Eugene adventures and experiences',
    category: 'travel',
    icon: 'map-pin',
    estimatedReadTime: '5-7 min read',
    prompt: `Create an engaging travel adventure blog post for Moxie Vacation Rentals featuring:

**Blog Post Structure:**

**Compelling Title & Introduction:**
- Create an attention-grabbing title that captures the adventure
- Opening paragraph that hooks readers and sets the scene
- Brief preview of what readers will discover

**The Journey Begins:**
- Set the scene: arriving in Eugene and first impressions
- Where the adventure started (specific Moxie property or location)
- Initial excitement and anticipation

**Adventure Highlights:**
- 3-4 specific Eugene experiences or attractions visited
- Detailed descriptions with sensory details (what you saw, heard, felt)
- Include insider tips and local secrets discovered
- Mix of popular attractions and hidden gems

**Local Connections & Discoveries:**
- Interactions with locals or Eugene community
- Unexpected discoveries or delightful surprises
- Authentic local experiences that only Eugene offers
- Food, culture, or nature experiences unique to the area

**Practical Travel Tips:**
- Best times to visit specific locations
- What to pack or prepare for similar adventures
- Transportation tips and getting around Eugene
- Budget-friendly options and splurge-worthy experiences

**Memorable Moments:**
- Specific moments that made the trip special
- Photos opportunities and Instagram-worthy spots
- Weather, seasons, and how they enhanced the experience
- Why these experiences are perfect for vacation rental guests

**Planning Your Own Adventure:**
- How to recreate similar experiences
- Which Moxie properties offer the best access to these adventures
- Seasonal considerations and best times to visit
- Booking recommendations and special packages

**Call to Action:**
- Encourage readers to book their own Eugene adventure
- Mention available Moxie properties and experiences
- Social media encouragement and hashtag suggestions

**Writing Style Guidelines:**
- Personal, engaging narrative voice
- Use vivid descriptions and storytelling techniques
- Include specific Eugene locations and details
- Balance inspiration with practical information
- Write in first person or engaging second person
- Create emotional connection with readers`
  },
  {
    id: 'local-guide',
    title: 'Eugene Local Guide',
    description: 'Comprehensive insider guide to Eugene attractions and experiences',
    category: 'local',
    icon: 'home',
    estimatedReadTime: '8-10 min read',
    prompt: `Create a comprehensive Eugene local guide blog post for Moxie Vacation Rentals featuring:

**Blog Post Structure:**

**Expert Introduction:**
- Position Moxie as Eugene's local accommodation experts
- Overview of what makes Eugene special and unique
- Promise of insider knowledge and local secrets

**Top Eugene Attractions:**
- 5-6 must-visit attractions with detailed descriptions
- What makes each special and why locals love them
- Best times to visit and insider tips for each
- Mix of outdoor, cultural, and entertainment options

**Dining Like a Local:**
- Local favorite restaurants and food experiences
- Hidden gem eateries that tourists often miss
- Seasonal specialties and farmers market highlights
- Price ranges and reservation recommendations

**Outdoor Adventures:**
- Best hiking trails and natural areas
- Seasonal outdoor activities and sports
- Parks and recreation areas locals frequent
- Equipment rentals and guided tour options

**Cultural & Arts Scene:**
- Local galleries, theaters, and music venues
- Community events and festivals throughout the year
- Museums and educational experiences
- Free cultural activities and events

**Shopping & Local Businesses:**
- Unique local shops and boutiques
- Farmers markets and artisan goods
- Eugene-specific products and souvenirs
- Supporting local businesses and community

**Neighborhood Highlights:**
- Different areas of Eugene and their personalities
- What each neighborhood offers visitors
- Transportation between areas
- Where to stay for different types of experiences

**Seasonal Considerations:**
- How Eugene changes throughout the year
- Best activities for each season
- Weather preparation and packing tips
- Special seasonal events and opportunities

**Local Secrets & Insider Tips:**
- Hidden spots that only locals know about
- Best times to visit popular attractions
- Free activities and budget-friendly options
- Local etiquette and cultural considerations

**Getting Around Eugene:**
- Transportation options and recommendations
- Walkable areas and bike-friendly routes
- Parking tips and public transportation
- Day trip possibilities from Eugene

**Booking Your Eugene Experience:**
- How to choose the right Moxie property for your interests
- Properties with best access to different attractions
- Package deals and local experience add-ons
- Planning tools and resources

**Writing Style Guidelines:**
- Authoritative but friendly local expert voice
- Include specific addresses and practical details
- Use current information and seasonal references
- Balance comprehensive coverage with readability
- Include actionable tips and specific recommendations`
  },
  {
    id: 'property-spotlight',
    title: 'Property Spotlight Feature',
    description: 'Showcase a specific property with local context and guest experiences',
    category: 'property',
    icon: 'home',
    estimatedReadTime: '6-8 min read',
    prompt: `Create a compelling property spotlight blog post for Moxie Vacation Rentals featuring:

**Blog Post Structure:**

**Property Introduction:**
- Captivating opening that showcases the property's unique character
- What makes this property special among Eugene accommodations
- Overview of ideal guests and perfect occasions for staying

**Visual Tour & Unique Features:**
- Detailed description of property layout and design
- Standout amenities and comfort features
- Interior highlights and special touches
- Outdoor spaces and views (if applicable)

**Location Advantages:**
- Specific nearby attractions within walking/driving distance
- Local restaurants, shops, and entertainment options
- Transportation convenience and accessibility
- Neighborhood character and local feel

**Guest Experience Stories:**
- Real or realistic guest scenarios and experiences
- How the property enhanced their Eugene visit
- Specific examples of memorable moments
- Different types of guests and their experiences

**Perfect For These Occasions:**
- Romantic getaways and special celebrations
- Family vacations and multi-generational trips
- Business travel and extended stays
- Group gatherings and special events

**Local Context & Activities:**
- Seasonal activities accessible from this property
- Year-round attractions and experiences nearby
- Local events and festivals the property is perfect for
- Outdoor adventures and cultural experiences

**Amenities Deep Dive:**
- Kitchen facilities and dining options
- Technology and work-from-property features
- Comfort amenities and luxury touches
- Pet-friendly features (if applicable)

**Guest Testimonials & Reviews:**
- Compelling guest quotes and experiences
- Specific details about what guests loved most
- How the property exceeded expectations
- Repeat guest stories and loyalty

**Photography & Social Media:**
- Description of the property's most photogenic features
- Instagram-worthy spots and photo opportunities
- Best lighting and times for photography
- Social media hashtags and encouragement

**Booking Information & Packages:**
- Special offers or packages for this property
- Seasonal pricing considerations and value
- Advance booking recommendations
- Additional services and add-ons available

**Exploring More Options:**
- How this property compares to other Moxie offerings
- Alternative properties for different needs
- Portfolio diversity and options for different preferences

**Writing Style Guidelines:**
- Aspirational and detailed descriptive writing
- Help readers envision their perfect stay
- Balance luxury appeal with practical information
- Use specific property details and local connections
- Create desire while providing useful booking information`
  },
  {
    id: 'guest-experience',
    title: 'Guest Experience Story',
    description: 'Feature authentic guest testimonials and memorable stay experiences',
    category: 'guest',
    icon: 'star',
    estimatedReadTime: '4-6 min read',
    prompt: `Create an authentic guest experience blog post for Moxie Vacation Rentals featuring:

**Blog Post Structure:**

**Guest Introduction:**
- Introduce the guests and what brought them to Eugene
- Their travel style and what they were seeking
- Why they chose Moxie and vacation rentals over hotels

**Arrival & First Impressions:**
- Their arrival experience at the property
- First impressions of the accommodation and Eugene
- Check-in process and welcome experience
- Initial excitement and anticipation

**Property Experience:**
- Which property they stayed in and why it was perfect
- Specific amenities and features they appreciated most
- How the property met or exceeded their expectations
- Comfort features that enhanced their stay

**Eugene Discoveries:**
- Local attractions and experiences they discovered
- Restaurants, activities, or hidden gems they found
- Recommendations from Moxie or local discoveries
- Unexpected pleasant surprises during their visit

**Memorable Moments:**
- Specific experiences that made their stay special
- Daily routines and how they used the property
- Social media moments and photo opportunities
- Weather, seasons, and how they enhanced the experience

**Local Interactions:**
- Connections with Eugene community or locals
- Local business experiences and recommendations
- Cultural events or festivals they attended
- Authentic Eugene experiences they valued

**Practical Insights:**
- What they packed and what they wished they'd brought
- Transportation and getting around Eugene
- Budget considerations and value experiences
- Tips for future guests with similar interests

**Why Vacation Rentals:**
- How the property compared to hotel experiences
- Space, privacy, and home-like comfort benefits
- Kitchen facilities and home amenities they used
- Cost savings and added value they experienced

**Future Plans & Recommendations:**
- Whether they plan to return to Eugene and Moxie
- What they'd do differently on a return visit
- Advice for first-time Eugene visitors
- Seasonal recommendations for future travelers

**Guest Testimonial Highlights:**
- Direct quotes about their experience
- Specific praise for property features or service
- How Moxie exceeded their expectations
- Recommendation to friends and family

**Photo & Memory Sharing:**
- Description of photos they took during their stay
- Favorite spots for capturing memories
- Social media posts and sharing experiences
- Property features they photographed and loved

**Inspiring Future Guests:**
- How similar travelers can recreate this experience
- Properties and packages offering comparable benefits
- Seasonal considerations for similar experiences
- Booking encouragement and next steps

**Writing Style Guidelines:**
- Personal and authentic storytelling approach
- Use direct quotes and specific guest details
- Balance personal story with universal appeal
- Include practical information for potential guests
- Create emotional connection and trust
- Showcase real experiences and genuine satisfaction`
  },
  {
    id: 'seasonal-activities',
    title: 'Seasonal Eugene Guide',
    description: 'Comprehensive guide to seasonal activities and experiences in Eugene',
    category: 'seasonal',
    icon: 'calendar',
    estimatedReadTime: '7-9 min read',
    prompt: `Create a comprehensive seasonal guide blog post for Moxie Vacation Rentals featuring:

**Blog Post Structure:**

**Seasonal Introduction:**
- What makes this season special in Eugene, Oregon
- Unique opportunities and experiences available now
- Why this is the perfect time for a Eugene vacation
- Weather overview and what to expect

**Top Seasonal Activities:**
- 5-7 must-do activities specific to this season
- Mix of outdoor adventures, cultural experiences, and local events
- Difficulty levels and duration for each activity
- Equipment needs and preparation recommendations

**Local Events & Festivals:**
- Major seasonal festivals and community celebrations
- Smaller, authentic local gatherings worth attending
- How to participate and what makes each special
- Ticket information and advance planning needs

**Outdoor Adventures:**
- Best hiking trails and natural areas for the season
- Seasonal sports and recreational activities
- Parks and outdoor spaces at their seasonal peak
- Wildlife viewing and nature photography opportunities

**Cultural & Arts Experiences:**
- Seasonal exhibitions and cultural programming
- Theater performances and live music specific to the season
- Art galleries featuring seasonal themes or local artists
- Educational programs and workshops available

**Food & Dining Seasonal Highlights:**
- Seasonal specialties at Eugene restaurants
- Farmers market offerings and seasonal produce
- Food festivals and culinary events happening now
- Seasonal beverages and local brewery/winery offerings

**Weather & Packing Guide:**
- Detailed weather expectations and variations
- Essential packing checklist for Eugene visitors
- Layering strategies and seasonal clothing needs
- Activity-specific gear and preparation tips

**Photography & Social Media:**
- Most beautiful locations for seasonal photography
- Best times of day for stunning seasonal shots
- Hidden spots showcasing Eugene's seasonal beauty
- Social media worthy experiences and hashtag suggestions

**Family-Friendly Seasonal Fun:**
- Activities perfect for families with children
- Educational seasonal programs and experiences
- Free or budget-friendly family activities
- Indoor alternatives for weather-dependent plans

**Romantic & Couples Experiences:**
- Perfect seasonal activities for couples
- Romantic dining and seasonal date ideas
- Scenic spots and intimate experiences
- Special packages and couple-friendly accommodations

**Budget-Friendly Options:**
- Free seasonal activities and entertainment
- Low-cost community events and programs
- Self-guided seasonal tours and explorations
- Money-saving tips for seasonal experiences

**Local Insider Secrets:**
- Hidden seasonal gems only locals know about
- Best times to visit popular spots to avoid crowds
- Local traditions and seasonal customs
- Off-the-beaten-path seasonal experiences

**Planning Your Seasonal Visit:**
- Best properties for seasonal activities and access
- Advance booking recommendations for seasonal travel
- Package deals and seasonal promotions available
- Transportation and logistics for seasonal activities

**Seasonal Safety & Preparation:**
- Safety considerations for seasonal activities
- Emergency preparedness and local resources
- Health and wellness tips for the season
- Local services and amenities available

**Writing Style Guidelines:**
- Enthusiastic and informative seasonal expert voice
- Include current seasonal information and timing
- Balance inspiration with practical planning details
- Use vivid seasonal descriptions and imagery
- Position Moxie as the perfect base for seasonal exploration`
  }
];

export const blogQuickPrompts = [
  "Write about a perfect weekend itinerary in Eugene for first-time visitors",
  "Create a foodie's guide to Eugene's best local restaurants and hidden gems",
  "Feature the top outdoor adventures and hiking trails around Eugene",
  "Showcase Eugene's arts and culture scene with insider recommendations", 
  "Write about the best family-friendly activities and attractions in Eugene",
  "Create a romantic getaway guide featuring intimate Eugene experiences"
];
