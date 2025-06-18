
import React from 'react';

interface NewsletterSection {
  type: 'hero' | 'content' | 'property' | 'events' | 'cta' | 'image';
  title?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
}

interface NewsletterTemplateProps {
  subject: string;
  sections: NewsletterSection[];
  preheader?: string;
}

const NewsletterTemplate = ({ subject, sections, preheader }: NewsletterTemplateProps) => {
  const generateNewsletterHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        /* Reset styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
        
        /* Moxie Brand Colors - Updated to match website */
        .gradient-bg { background: linear-gradient(135deg, hsl(220, 8%, 85%) 0%, hsl(220, 3%, 97%) 100%); }
        .gradient-accent { background: linear-gradient(135deg, hsl(220, 6%, 88%) 0%, hsl(220, 4%, 96%) 100%); }
        .text-primary { color: hsl(222.2, 47.4%, 11.2%); }
        .text-secondary { color: hsl(215.4, 16.3%, 46.9%); }
        .text-white { color: #ffffff; }
        .bg-white { background-color: #ffffff; }
        
        /* Layout */
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .section { padding: 32px 24px; }
        .hero-section { padding: 48px 24px; text-align: center; }
        .content-section { padding: 24px; }
        .footer-section { padding: 32px 24px; background: hsl(210, 40%, 96.1%); }
        
        /* Typography */
        .hero-title { font-size: 32px; font-weight: bold; margin-bottom: 16px; line-height: 1.2; color: hsl(222.2, 47.4%, 11.2%); }
        .hero-subtitle { font-size: 18px; opacity: 0.8; margin-bottom: 24px; color: hsl(222.2, 47.4%, 11.2%); }
        .section-title { font-size: 24px; font-weight: bold; margin-bottom: 16px; color: hsl(222.2, 47.4%, 11.2%); }
        .content-text { font-size: 16px; line-height: 1.6; color: hsl(215.4, 16.3%, 46.9%); margin-bottom: 16px; }
        
        /* Components */
        .button { 
            display: inline-block; 
            background: hsl(222.2, 47.4%, 11.2%); 
            color: white; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600;
            margin: 16px 0;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background: hsl(222.2, 47.4%, 15%);
        }
        .property-card { 
            border: 1px solid hsl(214.3, 31.8%, 91.4%); 
            border-radius: 12px; 
            overflow: hidden; 
            margin: 16px 0; 
        }
        .property-image { width: 100%; height: 200px; object-fit: cover; }
        .divider { height: 1px; background: hsl(214.3, 31.8%, 91.4%); margin: 24px 0; }
        
        /* Mobile responsive */
        @media (max-width: 600px) {
            .hero-title { font-size: 28px; }
            .section { padding: 24px 16px; }
            .hero-section { padding: 32px 16px; }
        }
    </style>
</head>
<body>
    <div class="container">
        ${preheader ? `<div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</div>` : ''}
        
        ${sections.map(section => {
          switch (section.type) {
            case 'hero':
              return `
                <div class="gradient-bg hero-section">
                    <div style="color: hsl(222.2, 47.4%, 11.2%);">
                        <h1 class="hero-title">${section.title || 'Moxie Vacation Rentals'}</h1>
                        <p class="hero-subtitle">${section.content || 'Your Home Base for Living Like a Local in Eugene'}</p>
                        ${section.buttonText ? `<a href="${section.buttonUrl || '#'}" class="button" style="background: hsl(222.2, 47.4%, 11.2%); border: 2px solid hsl(222.2, 47.4%, 11.2%); color: white;">${section.buttonText}</a>` : ''}
                    </div>
                </div>`;
            
            case 'content':
              return `
                <div class="section">
                    ${section.title ? `<h2 class="section-title">${section.title}</h2>` : ''}
                    <div class="content-text">${section.content || ''}</div>
                    ${section.buttonText ? `<a href="${section.buttonUrl || '#'}" class="button">${section.buttonText}</a>` : ''}
                </div>`;
            
            case 'property':
              return `
                <div class="section">
                    <div class="property-card">
                        ${section.imageUrl ? `<img src="${section.imageUrl}" alt="Property" class="property-image">` : ''}
                        <div style="padding: 20px;">
                            ${section.title ? `<h3 style="font-size: 20px; font-weight: bold; margin-bottom: 12px; color: hsl(222.2, 47.4%, 11.2%);">${section.title}</h3>` : ''}
                            <p class="content-text">${section.content || ''}</p>
                            ${section.buttonText ? `<a href="${section.buttonUrl || '#'}" class="button">${section.buttonText}</a>` : ''}
                        </div>
                    </div>
                </div>`;
            
            case 'events':
              return `
                <div class="section">
                    <div class="gradient-accent" style="padding: 24px; border-radius: 12px;">
                        ${section.title ? `<h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: hsl(222.2, 47.4%, 11.2%);">${section.title}</h3>` : ''}
                        <div class="content-text">${section.content || ''}</div>
                        ${section.buttonText ? `<a href="${section.buttonUrl || '#'}" class="button">${section.buttonText}</a>` : ''}
                    </div>
                </div>`;
            
            case 'image':
              return `
                <div class="section">
                    ${section.imageUrl ? `<img src="${section.imageUrl}" alt="${section.title || 'Newsletter Image'}" style="width: 100%; border-radius: 12px; margin-bottom: 16px;">` : ''}
                    ${section.title ? `<h3 class="section-title">${section.title}</h3>` : ''}
                    ${section.content ? `<div class="content-text">${section.content}</div>` : ''}
                </div>`;
            
            case 'cta':
              return `
                <div class="section gradient-accent" style="text-align: center;">
                    ${section.title ? `<h2 class="section-title">${section.title}</h2>` : ''}
                    ${section.content ? `<p class="content-text">${section.content}</p>` : ''}
                    ${section.buttonText ? `<a href="${section.buttonUrl || '#'}" class="button" style="font-size: 18px; padding: 16px 32px;">${section.buttonText}</a>` : ''}
                </div>`;
            
            default:
              return '';
          }
        }).join('')}
        
        <div class="footer-section">
            <div style="text-align: center; color: hsl(215.4, 16.3%, 46.9%); font-size: 14px;">
                <p style="margin-bottom: 16px;"><strong>Moxie Vacation Rentals</strong></p>
                <p style="margin-bottom: 12px;">Your Home Base for Living Like a Local in Eugene</p>
                <p style="margin-bottom: 16px;">Eugene, Oregon | contact@moxievacationrentals.com</p>
                <div style="margin-bottom: 16px;">
                    <a href="#" style="color: hsl(217, 91%, 60%); text-decoration: none; margin: 0 8px;">Visit Our Website</a>
                    <a href="#" style="color: hsl(217, 91%, 60%); text-decoration: none; margin: 0 8px;">View Properties</a>
                </div>
                <p style="font-size: 12px; color: hsl(215.4, 16.3%, 46.9%);">
                    <a href="#" style="color: hsl(215.4, 16.3%, 46.9%); text-decoration: none;">Unsubscribe</a> | 
                    <a href="#" style="color: hsl(215.4, 16.3%, 46.9%); text-decoration: none; margin-left: 8px;">Update Preferences</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  return (
    <div 
      className="w-full h-full"
      dangerouslySetInnerHTML={{ __html: generateNewsletterHTML() }}
    />
  );
};

export default NewsletterTemplate;
