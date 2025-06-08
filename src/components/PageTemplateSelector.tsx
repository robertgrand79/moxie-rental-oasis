
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Phone, Info, Briefcase, MapPin, Heart, HelpCircle } from 'lucide-react';

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  slug: string;
}

interface PageTemplateSelectorProps {
  onSelectTemplate: (template: PageTemplate) => void;
  onStartBlank: () => void;
}

const pageTemplates: PageTemplate[] = [
  {
    id: 'about',
    name: 'About Us',
    description: 'Tell your story and introduce your team',
    icon: Info,
    slug: 'about-us',
    content: `<h1>About Us</h1>
<p>Welcome to our company! We're passionate about providing exceptional service and creating memorable experiences.</p>

<h2>Our Story</h2>
<p>Founded with a vision to make a difference, we've been serving our community with dedication and excellence.</p>

<h2>Our Mission</h2>
<p>To deliver outstanding value and service while building lasting relationships with our clients.</p>

<h2>Our Team</h2>
<p>Our experienced team brings together diverse skills and expertise to serve you better.</p>`
  },
  {
    id: 'contact',
    name: 'Contact Us',
    description: 'Help visitors get in touch with you',
    icon: Phone,
    slug: 'contact',
    content: `<h1>Contact Us</h1>
<p>We'd love to hear from you! Get in touch with us using the information below.</p>

<h2>Get In Touch</h2>
<p><strong>Phone:</strong> (555) 123-4567</p>
<p><strong>Email:</strong> info@example.com</p>
<p><strong>Address:</strong> 123 Main Street, City, State 12345</p>

<h2>Business Hours</h2>
<p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
<p><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
<p><strong>Sunday:</strong> Closed</p>

<h2>Send Us a Message</h2>
<p>Feel free to reach out with any questions or inquiries. We'll get back to you as soon as possible.</p>`
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Showcase what you offer',
    icon: Briefcase,
    slug: 'services',
    content: `<h1>Our Services</h1>
<p>We offer a comprehensive range of services designed to meet your needs.</p>

<h2>Service One</h2>
<p>Description of your first service and how it benefits your clients.</p>

<h2>Service Two</h2>
<p>Description of your second service and its unique features.</p>

<h2>Service Three</h2>
<p>Description of your third service and why clients choose it.</p>

<h2>Why Choose Us?</h2>
<ul>
<li>Expert knowledge and experience</li>
<li>Personalized service approach</li>
<li>Competitive pricing</li>
<li>Customer satisfaction guarantee</li>
</ul>`
  },
  {
    id: 'location',
    name: 'Location & Directions',
    description: 'Help visitors find you',
    icon: MapPin,
    slug: 'location',
    content: `<h1>Location & Directions</h1>
<p>Find us easily with the information below.</p>

<h2>Our Address</h2>
<p>123 Main Street<br>
City, State 12345</p>

<h2>Directions</h2>
<p><strong>From Downtown:</strong> Take Main Street north for 2 miles.</p>
<p><strong>From Highway:</strong> Exit at Main Street and head south for 1 mile.</p>

<h2>Parking</h2>
<p>Free parking is available in our lot behind the building.</p>

<h2>Public Transportation</h2>
<p>We're accessible by bus routes 15 and 23, with stops within walking distance.</p>`
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Share customer feedback and reviews',
    icon: Heart,
    slug: 'testimonials',
    content: `<h1>What Our Customers Say</h1>
<p>Don't just take our word for it - hear from our satisfied customers.</p>

<blockquote>
<p>"Exceptional service and attention to detail. Highly recommended!"</p>
<footer>- Sarah Johnson</footer>
</blockquote>

<blockquote>
<p>"Professional, reliable, and always exceeds expectations."</p>
<footer>- Mike Davis</footer>
</blockquote>

<blockquote>
<p>"Outstanding quality and customer service. Will definitely use again."</p>
<footer>- Jennifer Smith</footer>
</blockquote>

<h2>Join Our Happy Customers</h2>
<p>Experience the difference for yourself. Contact us today to get started.</p>`
  },
  {
    id: 'faq',
    name: 'FAQ',
    description: 'Answer common questions',
    icon: HelpCircle,
    slug: 'faq',
    content: `<h1>Frequently Asked Questions</h1>
<p>Find answers to the most common questions about our services.</p>

<h2>How do I get started?</h2>
<p>Simply contact us through our website or give us a call to discuss your needs.</p>

<h2>What are your rates?</h2>
<p>Our rates vary depending on the service. Contact us for a personalized quote.</p>

<h2>Do you offer consultations?</h2>
<p>Yes, we offer free initial consultations to understand your requirements.</p>

<h2>What is your turnaround time?</h2>
<p>Turnaround times depend on the project scope. We'll provide estimated timelines upfront.</p>

<h2>Do you provide ongoing support?</h2>
<p>Absolutely! We offer ongoing support and maintenance for all our services.</p>`
  }
];

const PageTemplateSelector = ({ onSelectTemplate, onStartBlank }: PageTemplateSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose a Page Template</h3>
        <p className="text-gray-600">Start with a pre-built template or create from scratch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <template.icon className="h-5 w-5 text-blue-600" />
                {template.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={() => onSelectTemplate(template)}
                className="w-full"
                variant="outline"
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Card className="inline-block">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-gray-400" />
              <div className="text-left">
                <h4 className="font-medium">Start from Scratch</h4>
                <p className="text-sm text-gray-600">Create a completely custom page</p>
              </div>
              <Button onClick={onStartBlank} variant="outline">
                Start Blank
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PageTemplateSelector;
