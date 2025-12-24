import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Search,
  Book,
  Home,
  Calendar,
  CreditCard,
  Globe,
  Users,
  Settings,
  MessageSquare,
  BarChart,
  HelpCircle,
  ExternalLink,
  PlayCircle,
  FileText,
  ArrowRight,
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  content?: string;
}

const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: Book, color: 'bg-blue-500' },
    { id: 'properties', label: 'Properties', icon: Home, color: 'bg-green-500' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'bg-purple-500' },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'bg-yellow-500' },
    { id: 'domains', label: 'Custom Domains', icon: Globe, color: 'bg-pink-500' },
    { id: 'team', label: 'Team Management', icon: Users, color: 'bg-indigo-500' },
  ];

  const gettingStartedSteps = [
    { step: 1, title: 'Create Your Account', description: 'Sign up and set up your organization profile.' },
    { step: 2, title: 'Add Your First Property', description: 'Add property details, photos, and pricing.' },
    { step: 3, title: 'Customize Your Site', description: 'Brand your site with colors, logos, and content.' },
    { step: 4, title: 'Connect Calendars', description: 'Sync with Airbnb, VRBO, and other platforms.' },
    { step: 5, title: 'Publish & Share', description: 'Go live and start accepting direct bookings.' },
  ];

  const ownerFAQs = [
    {
      question: 'How do I add a new property?',
      answer: 'Go to Properties in the sidebar, click "Add Property", and fill in the details including address, description, amenities, photos, and pricing. Your property will be visible on your site immediately after saving.',
    },
    {
      question: 'How do I connect my Airbnb calendar?',
      answer: 'Edit your property, scroll to the Calendar Sync section, and paste your Airbnb iCal export URL. You can find this in Airbnb under Listing > Availability > iCal. The calendar will sync automatically every few hours.',
    },
    {
      question: 'How do I set up a custom domain?',
      answer: 'Go to Settings > Domain, enter your domain name, and add the provided DNS records to your domain registrar. Verification typically takes 24-48 hours. Once verified, your site will be accessible at your custom domain.',
    },
    {
      question: 'How do I change my subscription?',
      answer: 'Navigate to Settings > Billing to view your current plan, upgrade or downgrade, update payment methods, and view billing history.',
    },
    {
      question: 'How do I export my bookings?',
      answer: 'Go to Host Management > Bookings, use the filters to select the date range you want, then click the Export button to download a CSV file.',
    },
    {
      question: 'How do I set different prices for different seasons?',
      answer: 'You can set seasonal pricing in the property editor under the Pricing tab. Add date ranges with specific prices, or connect PriceLabs for dynamic pricing.',
    },
    {
      question: 'How do I manage multiple team members?',
      answer: 'Go to Settings > Users to invite team members, assign roles (Admin, Manager, Staff), and control their permissions.',
    },
    {
      question: 'How do I view my analytics and reports?',
      answer: 'Visit the Reports section in the sidebar to see occupancy rates, revenue, booking trends, and more. Export reports for accounting or analysis.',
    },
  ];

  const guestFAQs = [
    {
      question: 'How do I book a property?',
      answer: 'Select your dates on the property page, enter guest count, and click Book Now. You\'ll be guided through payment and confirmation.',
    },
    {
      question: 'What\'s the cancellation policy?',
      answer: 'Cancellation policies vary by property. Check the booking details before confirming. Common policies include Flexible, Moderate, and Strict.',
    },
    {
      question: 'How do I contact the owner?',
      answer: 'After booking, you can message the owner through the guest portal or use the contact information in your confirmation email.',
    },
    {
      question: 'When do I get check-in instructions?',
      answer: 'Check-in instructions are typically sent 24-48 hours before your arrival. You can also access them in the guest portal.',
    },
    {
      question: 'Can I modify my booking?',
      answer: 'Contact the property owner to request modifications. Changes to dates or guest count may affect pricing.',
    },
  ];

  const troubleshootingGuides = [
    {
      title: 'Calendar Not Syncing',
      steps: [
        'Verify the iCal URL is correct and accessible',
        'Check if the external calendar has recent events',
        'Try removing and re-adding the calendar connection',
        'Wait 2-4 hours for the next sync cycle',
        'Contact support if issues persist',
      ],
    },
    {
      title: 'Domain Not Connecting',
      steps: [
        'Confirm DNS records match exactly (including trailing dots)',
        'Wait 24-48 hours for DNS propagation',
        'Check for typos in the domain name',
        'Verify the domain is not expired',
        'Contact your domain registrar for DNS issues',
      ],
    },
    {
      title: 'Payment Failures',
      steps: [
        'Verify your Stripe account is properly connected',
        'Check if the guest\'s card was declined',
        'Ensure 3D Secure completed successfully',
        'Review Stripe dashboard for error details',
        'Contact guest to try a different payment method',
      ],
    },
  ];

  const filteredFAQs = [...ownerFAQs, ...guestFAQs].filter(
    (faq) =>
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers, guides, and support for StayMoxie
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 rounded-full ${cat.color} mx-auto mb-2 flex items-center justify-center`}>
                <cat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium">{cat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="owner-faq">Owner FAQ</TabsTrigger>
          <TabsTrigger value="guest-faq">Guest FAQ</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Getting Started Guide
              </CardTitle>
              <CardDescription>
                Follow these steps to set up your StayMoxie site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gettingStartedSteps.map((step, index) => (
                  <div key={step.step} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {index < gettingStartedSteps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Video Tutorials
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Watch step-by-step tutorials for common tasks
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Property Setup', 'Calendar Sync', 'Site Customization'].map((title) => (
                    <div key={title} className="p-3 bg-background rounded border hover:shadow-sm cursor-pointer">
                      <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                        <PlayCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">{title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owner-faq">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Owner FAQ
              </CardTitle>
              <CardDescription>
                Frequently asked questions for property owners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {(searchQuery ? filteredFAQs.filter(f => ownerFAQs.includes(f)) : ownerFAQs).map((faq, index) => (
                  <AccordionItem key={index} value={`owner-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guest-faq">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Guest FAQ
              </CardTitle>
              <CardDescription>
                Common questions from guests (add to your site)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {(searchQuery ? filteredFAQs.filter(f => guestFAQs.includes(f)) : guestFAQs).map((faq, index) => (
                  <AccordionItem key={index} value={`guest-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting">
          <div className="space-y-6">
            {troubleshootingGuides.map((guide, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2">
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-muted-foreground">
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Contact Support */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-8 text-center">
          <MessageSquare className="h-10 w-10 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-4">
            Our support team is here to assist you
          </p>
          <div className="flex justify-center gap-4">
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Status Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpCenterPage;
