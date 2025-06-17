
import React from 'react';

interface NewsletterSection {
  type: 'hero' | 'content' | 'property' | 'events' | 'cta' | 'image';
  title?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export const parseContentToSections = (content: string, subject: string): NewsletterSection[] => {
  const sections: NewsletterSection[] = [];
  
  // Always start with hero section
  sections.push({
    type: 'hero',
    title: 'Moxie Vacation Rentals',
    content: 'Your Home Base for Living Like a Local in Eugene',
    buttonText: 'View Properties',
    buttonUrl: '#'
  });

  // Parse the AI-generated content
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  paragraphs.forEach((paragraph, index) => {
    const text = paragraph.trim();
    
    // Skip empty paragraphs
    if (!text) return;
    
    // Detect section types based on content patterns
    if (text.toLowerCase().includes('welcome') || text.toLowerCase().includes('greeting')) {
      sections.push({
        type: 'content',
        title: 'Welcome to Eugene!',
        content: text,
      });
    } else if (text.toLowerCase().includes('property') || text.toLowerCase().includes('rental') || text.toLowerCase().includes('stay')) {
      sections.push({
        type: 'property',
        title: 'Featured Property',
        content: text,
        imageUrl: '/lovable-uploads/d73f2e35-5081-40d8-a4a8-62765cdea308.png',
        buttonText: 'View Property',
        buttonUrl: '#'
      });
    } else if (text.toLowerCase().includes('event') || text.toLowerCase().includes('happening') || text.toLowerCase().includes('festival')) {
      sections.push({
        type: 'events',
        title: 'Upcoming Events in Eugene',
        content: text,
        buttonText: 'View Events',
        buttonUrl: '#'
      });
    } else if (text.toLowerCase().includes('book') || text.toLowerCase().includes('reserve') || text.toLowerCase().includes('stay with us')) {
      sections.push({
        type: 'cta',
        title: 'Ready to Experience Eugene?',
        content: text,
        buttonText: 'Book Your Stay',
        buttonUrl: '#'
      });
    } else {
      // Regular content section
      sections.push({
        type: 'content',
        title: index === 0 ? subject.replace('New Post: ', '').replace('Newsletter: ', '') : undefined,
        content: text,
      });
    }
  });

  // Always end with a CTA if we don't have one
  const hasCTA = sections.some(s => s.type === 'cta');
  if (!hasCTA) {
    sections.push({
      type: 'cta',
      title: 'Book Your Eugene Adventure',
      content: 'Experience the best of Eugene with our premium vacation rentals. Local expertise, exceptional properties, unforgettable stays.',
      buttonText: 'Explore Properties',
      buttonUrl: '#'
    });
  }

  return sections;
};

export const generatePreheader = (subject: string, content: string): string => {
  const firstLine = content.split('\n')[0]?.trim();
  return firstLine?.substring(0, 100) + '...' || `${subject} - Your Eugene adventure awaits!`;
};

// Utility function to add images based on content type
export const enhanceWithImages = (sections: NewsletterSection[]): NewsletterSection[] => {
  return sections.map(section => {
    if (section.type === 'property' && !section.imageUrl) {
      section.imageUrl = '/lovable-uploads/d73f2e35-5081-40d8-a4a8-62765cdea308.png';
    }
    
    if (section.type === 'content' && section.content && section.content.toLowerCase().includes('eugene')) {
      // Add Eugene scenic images for location-focused content
      section.type = 'image';
      section.imageUrl = '/placeholder.svg?height=300&width=600&text=Eugene+Oregon';
    }
    
    return section;
  });
};
