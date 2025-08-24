import { BlogPost } from '@/types/blogPost';
import { EugeneEvent } from '@/hooks/useEugeneEvents';
import { Place } from '@/hooks/usePlaces';
import { format } from 'date-fns';

export const generateContentTemplate = (
  contentType: 'blog_posts' | 'events' | 'places',
  items: (BlogPost | EugeneEvent | Place)[]
): string => {
  if (items.length === 0) return '';

  let template = '';

  if (contentType === 'blog_posts') {
    const posts = items as BlogPost[];
    posts.forEach((post, index) => {
      template += `
<div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
  ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" style="width: 100%; height: 200px; object-fit: cover;">` : ''}
  <div style="padding: 20px;">
    <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold; color: #1f2937;">${post.title}</h2>
    <p style="margin: 0 0 15px 0; color: #6b7280; line-height: 1.6;">${post.excerpt}</p>
    <div style="margin-bottom: 15px;">
      ${post.category ? `<span style="background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">${post.category}</span>` : ''}
      <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${post.content_type}</span>
    </div>
    <a href="${window.location.origin}/blog/${post.slug}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 500;">Read More</a>
  </div>
</div>`;
      if (index < posts.length - 1) template += '\n';
    });
  }

  if (contentType === 'events') {
    const events = items as EugeneEvent[];
    events.forEach((event, index) => {
      template += `
<div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
  ${event.image_url ? `<img src="${event.image_url}" alt="${event.title}" style="width: 100%; height: 200px; object-fit: cover;">` : ''}
  <div style="padding: 20px;">
    <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold; color: #1f2937;">${event.title}</h2>
    ${event.description ? `<p style="margin: 0 0 15px 0; color: #6b7280; line-height: 1.6;">${event.description}</p>` : ''}
    <div style="margin-bottom: 15px;">
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <span style="font-weight: 500; color: #374151; margin-right: 8px;">📅</span>
        <span style="color: #6b7280;">${format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}</span>
      </div>
      ${event.time_start ? `
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <span style="font-weight: 500; color: #374151; margin-right: 8px;">⏰</span>
        <span style="color: #6b7280;">${event.time_start}${event.time_end ? ` - ${event.time_end}` : ''}</span>
      </div>` : ''}
      ${event.location ? `
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <span style="font-weight: 500; color: #374151; margin-right: 8px;">📍</span>
        <span style="color: #6b7280;">${event.location}</span>
      </div>` : ''}
      ${event.category ? `<span style="background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">${event.category}</span>` : ''}
      ${event.price_range ? `<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${event.price_range}</span>` : ''}
    </div>
    <div style="display: flex; gap: 10px;">
      ${event.ticket_url ? `<a href="${event.ticket_url}" style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 500;">Get Tickets</a>` : ''}
      ${event.website_url ? `<a href="${event.website_url}" style="display: inline-block; background: #6b7280; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 500;">Learn More</a>` : ''}
    </div>
  </div>
</div>`;
      if (index < events.length - 1) template += '\n';
    });
  }

  if (contentType === 'places') {
    const places = items as Place[];
    places.forEach((place, index) => {
      template += `
<div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
  ${place.image_url ? `<img src="${place.image_url}" alt="${place.name}" style="width: 100%; height: 200px; object-fit: cover;">` : ''}
  <div style="padding: 20px;">
    <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold; color: #1f2937;">${place.name}</h2>
    ${place.description ? `<p style="margin: 0 0 15px 0; color: #6b7280; line-height: 1.6;">${place.description}</p>` : ''}
    <div style="margin-bottom: 15px;">
      ${place.address ? `
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <span style="font-weight: 500; color: #374151; margin-right: 8px;">📍</span>
        <span style="color: #6b7280;">${place.address}</span>
      </div>` : ''}
      ${place.phone ? `
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <span style="font-weight: 500; color: #374151; margin-right: 8px;">📞</span>
        <span style="color: #6b7280;">${place.phone}</span>
      </div>` : ''}
      <div style="margin-top: 10px;">
        ${place.category ? `<span style="background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">${place.category}</span>` : ''}
        ${place.price_level ? `<span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">${'$'.repeat(place.price_level)}</span>` : ''}
        ${place.rating ? `<span style="background: #fef9c3; color: #a16207; padding: 4px 8px; border-radius: 4px; font-size: 12px;">★ ${place.rating}</span>` : ''}
      </div>
    </div>
    ${place.website_url ? `<a href="${place.website_url}" style="display: inline-block; background: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 500;">Visit Website</a>` : ''}
  </div>
</div>`;
      if (index < places.length - 1) template += '\n';
    });
  }

  return template;
};