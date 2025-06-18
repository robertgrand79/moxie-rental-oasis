export interface BlogTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  estimatedReadTime: string;
  prompt: string;
}

export const blogTemplates: BlogTemplate[] = [
  {
    id: 'eugene-local-guide',
    title: "Eugene Local Experience Guide",
    description: "In-depth guide to experiencing Eugene like a local",
    category: "Local Guide",
    icon: "map-pin",
    estimatedReadTime: "8-10 min read",
    prompt: `Write a comprehensive blog post about experiencing Eugene, Oregon like a local resident. Focus on creating engaging, flowing content that works perfectly with rich text editors.

    CRITICAL FORMATTING REQUIREMENTS:
    - Write in clean, natural prose without any markdown syntax
    - NEVER use ### or ## for headings - write descriptive section titles as regular text
    - NEVER use *** or ** for bold text - write naturally and let the editor handle emphasis
    - NEVER use * for italic text - write naturally  
    - NEVER use - or * for bullet points - write in flowing paragraph form
    - Focus on storytelling and engaging narrative flow
    - Write as if you're writing directly in a word processor

    PARAGRAPH STRUCTURE REQUIREMENTS:
    - Create distinct, well-structured paragraphs for maximum readability
    - Each paragraph should focus on ONE main topic or idea
    - Use double line breaks between paragraphs to create clear separation
    - Write 2-4 sentences per paragraph for optimal readability
    - Create natural transitions between paragraphs
    - Structure content with clear topic progression
    - Make content easily scannable with proper paragraph spacing

    Content should flow naturally in well-structured paragraphs and include:
    
    Opening paragraph introducing Eugene's unique character and what makes it special for visitors seeking authentic experiences.
    
    Separate paragraphs for local dining experiences that go beyond typical tourist recommendations, including hidden gems, local favorites, and seasonal specialties that showcase Eugene's food culture.
    
    Individual paragraphs covering outdoor adventures and recreation opportunities that locals enjoy, from lesser-known hiking trails to river activities and seasonal outdoor pursuits.
    
    Distinct paragraphs about cultural attractions and community events that give visitors insight into Eugene's vibrant arts scene, university culture, and local traditions.
    
    Well-structured paragraphs for neighborhood exploration guide highlighting different areas of Eugene, their unique characteristics, and what visitors can discover in each.
    
    Separate paragraphs with practical local tips for transportation, shopping, and navigating Eugene like someone who lives here.
    
    Individual paragraphs covering seasonal considerations and the best times to experience different aspects of Eugene's local culture.
    
    Closing paragraph with compelling reasons to choose Moxie Vacation Rentals for the most authentic local experience.
    
    Write in a warm, conversational tone as if you're a Eugene resident sharing favorite spots and insider knowledge with a friend who's visiting. Structure each topic in its own well-defined paragraph for maximum readability.`
  },
  {
    id: 'eugene-seasonal-guide',
    title: "Eugene Seasonal Activities Guide",
    description: "Showcase the best seasonal experiences in Eugene",
    category: "Seasonal",
    icon: "calendar",
    estimatedReadTime: "7-9 min read",
    prompt: `Create an engaging blog post about seasonal activities and experiences in Eugene, Oregon. Write in flowing, natural prose that works perfectly with rich text editors.

    CRITICAL FORMATTING REQUIREMENTS:
    - Write in clean, natural prose without any markdown syntax
    - NEVER use ### or ## for headings - write descriptive section titles as regular text
    - NEVER use *** or ** for bold text - write naturally and let the editor handle emphasis
    - NEVER use * for italic text - write naturally  
    - NEVER use - or * for bullet points - write in flowing paragraph form
    - Focus on storytelling and engaging narrative flow
    - Write as if you're writing directly in a word processor

    PARAGRAPH STRUCTURE REQUIREMENTS:
    - Create distinct, well-structured paragraphs for maximum readability
    - Each paragraph should focus on ONE main topic or idea
    - Use double line breaks between paragraphs to create clear separation
    - Write 2-4 sentences per paragraph for optimal readability
    - Create natural transitions between paragraphs
    - Structure content with clear topic progression
    - Make content easily scannable with proper paragraph spacing

    Content should naturally progress through well-structured paragraphs covering:
    
    Introduction paragraph about Eugene's distinct seasons and how each offers unique experiences for vacation rental guests.
    
    Separate paragraphs for spring activities including cherry blossoms, emerging hiking trails, local festivals, and the awakening of outdoor farmers markets and cultural events.
    
    Individual paragraphs highlighting summer adventures with river activities, outdoor concerts, hiking opportunities, local beer gardens, and the vibrant energy of Eugene's peak season.
    
    Distinct paragraphs covering fall experiences featuring harvest season, changing foliage, university events, indoor cultural activities, and cozy local gathering spots.
    
    Well-structured paragraphs about winter activities showcasing Eugene's milder climate advantages, indoor attractions, holiday events, nearby skiing, and the charm of off-season local life.
    
    Separate paragraphs for year-round attractions that visitors can enjoy regardless of when they visit Eugene.
    
    Individual paragraphs with tips for planning visits during different seasons and what to pack for each time of year.
    
    Closing paragraphs with recommendations for how Moxie's vacation rental properties provide the perfect base for seasonal exploration.
    
    Write as a local expert who understands how to make the most of Eugene's offerings throughout the year. Structure each seasonal topic in its own well-defined paragraph for excellent readability.`
  },
  {
    id: 'university-oregon-guide',
    title: "University of Oregon Visitor Guide",
    description: "Guide for visitors connecting with UO campus and culture",
    category: "University",
    icon: "home",
    estimatedReadTime: "6-8 min read",
    prompt: `Write a comprehensive blog post for visitors interested in University of Oregon campus and the student culture that shapes Eugene. Use natural, flowing prose that works perfectly with rich text editors.

    CRITICAL FORMATTING REQUIREMENTS:
    - Write in clean, natural prose without any markdown syntax
    - NEVER use ### or ## for headings - write descriptive section titles as regular text
    - NEVER use *** or ** for bold text - write naturally and let the editor handle emphasis
    - NEVER use * for italic text - write naturally  
    - NEVER use - or * for bullet points - write in flowing paragraph form
    - Focus on storytelling and engaging narrative flow
    - Write as if you're writing directly in a word processor

    PARAGRAPH STRUCTURE REQUIREMENTS:
    - Create distinct, well-structured paragraphs for maximum readability
    - Each paragraph should focus on ONE main topic or idea
    - Use double line breaks between paragraphs to create clear separation
    - Write 2-4 sentences per paragraph for optimal readability
    - Create natural transitions between paragraphs
    - Structure content with clear topic progression
    - Make content easily scannable with proper paragraph spacing

    Content should seamlessly cover:
    
    Introduction to how the University of Oregon influences Eugene's character and creates opportunities for visitors to experience college town culture.
    
    Campus highlights and landmarks that visitors can explore, including iconic buildings, museums, galleries, and beautiful outdoor spaces.
    
    Sports culture and how visitors can experience Oregon Ducks athletics, from football games at Autzen Stadium to other sporting events and the excitement they bring to the city.
    
    Student life areas where visitors can experience college town atmosphere, including campus-adjacent dining, entertainment, and social spots.
    
    Cultural events and activities hosted by the university that are open to the public, including performances, lectures, and community events.
    
    Academic attractions like museums, libraries, and special collections that offer educational experiences for visitors.
    
    Seasonal campus events and how university life changes throughout the academic year.
    
    How staying in Eugene's vacation rentals provides convenient access to campus while offering more space and amenities than traditional accommodations.
    
    Tips for visitors planning trips around university events or sports seasons.
    
    Write with enthusiasm for both the university's contributions to Eugene and the unique opportunities this creates for vacation rental guests.`
  },
  {
    id: 'eugene-food-drink',
    title: "Eugene Food and Drink Scene",
    description: "Explore Eugene's culinary landscape and local beverages",
    category: "Food & Drink",
    icon: "star",
    estimatedReadTime: "7-9 min read",
    prompt: `Create an enticing blog post about Eugene's food and drink scene that will make readers excited to explore local culinary offerings. Write in engaging, descriptive prose that works perfectly with rich text editors.

    CRITICAL FORMATTING REQUIREMENTS:
    - Write in clean, natural prose without any markdown syntax
    - NEVER use ### or ## for headings - write descriptive section titles as regular text
    - NEVER use *** or ** for bold text - write naturally and let the editor handle emphasis
    - NEVER use * for italic text - write naturally  
    - NEVER use - or * for bullet points - write in flowing paragraph form
    - Focus on storytelling and engaging narrative flow
    - Write as if you're writing directly in a word processor

    PARAGRAPH STRUCTURE REQUIREMENTS:
    - Create distinct, well-structured paragraphs for maximum readability
    - Each paragraph should focus on ONE main topic or idea
    - Use double line breaks between paragraphs to create clear separation
    - Write 2-4 sentences per paragraph for optimal readability
    - Create natural transitions between paragraphs
    - Structure content with clear topic progression
    - Make content easily scannable with proper paragraph spacing

    Content should flow naturally through:
    
    Introduction to Eugene's diverse and evolving food scene, highlighting what makes it special in the Pacific Northwest.
    
    Local restaurant highlights spanning from casual eateries to fine dining, focusing on establishments that showcase local ingredients and innovative cuisine.
    
    Eugene's craft beer culture, including local breweries, taphouses, and the connection between beer and local community gathering.
    
    Coffee culture and local roasters that contribute to Eugene's vibrant cafe scene and community atmosphere.
    
    Farmers markets and local food producers that supply restaurants and provide direct access to regional specialties.
    
    Food festivals and culinary events that visitors might time their trips around.
    
    Local specialties and regional dishes that visitors should definitely try while in Eugene.
    
    Dining experiences that pair well with outdoor activities and sightseeing.
    
    How vacation rental accommodations allow guests to shop at local markets and prepare meals with regional ingredients.
    
    Seasonal food experiences and how Eugene's culinary scene changes throughout the year.
    
    Write with the passion of a local food enthusiast who wants visitors to discover Eugene's best culinary secrets and authentic dining experiences.`
  },
  {
    id: 'eugene-outdoor-recreation',
    title: "Eugene Outdoor Recreation Guide",
    description: "Complete guide to outdoor activities and adventures",
    category: "Outdoor Recreation",
    icon: "calendar",
    estimatedReadTime: "8-10 min read",
    prompt: `Write an inspiring blog post about Eugene's incredible outdoor recreation opportunities. Use engaging, descriptive language that works perfectly with rich text editors.

    CRITICAL FORMATTING REQUIREMENTS:
    - Write in clean, natural prose without any markdown syntax
    - NEVER use ### or ## for headings - write descriptive section titles as regular text
    - NEVER use *** or ** for bold text - write naturally and let the editor handle emphasis
    - NEVER use * for italic text - write naturally  
    - NEVER use - or * for bullet points - write in flowing paragraph form
    - Focus on storytelling and engaging narrative flow
    - Write as if you're writing directly in a word processor

    PARAGRAPH STRUCTURE REQUIREMENTS:
    - Create distinct, well-structured paragraphs for maximum readability
    - Each paragraph should focus on ONE main topic or idea
    - Use double line breaks between paragraphs to create clear separation
    - Write 2-4 sentences per paragraph for optimal readability
    - Create natural transitions between paragraphs
    - Structure content with clear topic progression
    - Make content easily scannable with proper paragraph spacing

    Content should naturally flow through:
    
    Introduction to Eugene's position as a gateway to Pacific Northwest outdoor adventures and its year-round recreation opportunities.
    
    Hiking and trail experiences from easy urban walks to challenging mountain hikes, including Spencer Butte, local park systems, and nearby wilderness areas.
    
    River and water activities along the Willamette River and nearby waterways, including kayaking, fishing, swimming, and riverside recreation.
    
    Cycling culture and bike-friendly infrastructure that makes Eugene perfect for recreational cycling and bike touring.
    
    Rock climbing and adventure sports available in the area for visitors seeking more challenging outdoor pursuits.
    
    Day trip opportunities to the Oregon Coast, Cascade Mountains, and other nearby natural attractions accessible from Eugene.
    
    Seasonal outdoor activities and how weather patterns create different recreation opportunities throughout the year.
    
    Family-friendly outdoor activities that accommodate visitors of all ages and activity levels.
    
    Gear and preparation tips for visitors planning outdoor adventures during their stay.
    
    How vacation rental properties provide convenient bases for outdoor exploration with space for gear storage and trip planning.
    
    Write with the enthusiasm of an outdoor enthusiast who wants to share the incredible natural playground that Eugene provides access to.`
  }
];

export const blogQuickPrompts = [
  "Write an engaging introduction to a blog post about pet-friendly activities in Eugene.",
  "Create a compelling opening paragraph for a blog post about the best coffee shops in Eugene.",
  "Generate an exciting introduction for a blog post about the University of Oregon.",
  "Write a creative title for a blog post about family-friendly activities in Eugene.",
  "Create a catchy title for a blog post about romantic getaways in Eugene.",
  "Generate a persuasive call to action for booking a vacation rental in Eugene.",
  "Write a short paragraph describing the benefits of staying in a vacation rental over a hotel in Eugene.",
  "Create a list of unique experiences that visitors can only have in Eugene.",
  "Generate a list of must-try restaurants in Eugene for foodies.",
  "Write a paragraph about the history of Eugene and its unique culture."
];
