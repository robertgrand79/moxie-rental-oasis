import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Book,
  Home,
  Calendar,
  CreditCard,
  Globe,
  Users,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  PlayCircle,
  ArrowRight,
  FileText,
  Loader2,
} from 'lucide-react';
import { useHelpCategories, useHelpArticles, useHelpFAQs, HelpCategory } from '@/hooks/useHelpContent';

const ICON_MAP: Record<string, React.ElementType> = {
  Book,
  Home,
  Calendar,
  CreditCard,
  Globe,
  Users,
  HelpCircle,
  FileText,
};

const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('getting-started');
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: categories, isLoading: loadingCategories } = useHelpCategories();
  const { data: articles, isLoading: loadingArticles } = useHelpArticles();
  const { data: ownerFAQs, isLoading: loadingOwnerFAQs } = useHelpFAQs('owner');
  const { data: guestFAQs, isLoading: loadingGuestFAQs } = useHelpFAQs('guest');

  const gettingStartedArticles = articles?.filter(a => a.article_type === 'getting_started') || [];
  const troubleshootingArticles = articles?.filter(a => a.article_type === 'troubleshooting') || [];

  const handleCategoryClick = (category: HelpCategory) => {
    // Map category to appropriate tab
    if (category.slug === 'getting-started') {
      setActiveTab('getting-started');
    } else {
      setActiveTab('troubleshooting');
    }
    // Scroll to content
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredOwnerFAQs = ownerFAQs?.filter(
    (faq) =>
      searchQuery === '' ||
      (faq.question?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (faq.answer?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ) || [];

  const filteredGuestFAQs = guestFAQs?.filter(
    (faq) =>
      searchQuery === '' ||
      (faq.question?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (faq.answer?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ) || [];

  const isLoading = loadingCategories || loadingArticles || loadingOwnerFAQs || loadingGuestFAQs;

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
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories?.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || HelpCircle;
            return (
              <Card 
                key={cat.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCategoryClick(cat)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 rounded-full ${cat.color} mx-auto mb-2 flex items-center justify-center`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-medium">{cat.name}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div ref={contentRef}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                  {gettingStartedArticles.map((article, index) => (
                    <div key={article.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{article.title}</h4>
                        <p className="text-sm text-muted-foreground">{article.content}</p>
                      </div>
                      {index < gettingStartedArticles.length - 1 && (
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
                  {filteredOwnerFAQs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`owner-${index}`}>
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
                  {filteredGuestFAQs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`guest-${index}`}>
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
              {troubleshootingArticles.map((article) => (
                <Card key={article.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2">
                      {article.content.split('\n').filter(s => s.trim()).map((step, stepIndex) => (
                        <li key={stepIndex} className="text-muted-foreground">
                          {step.replace(/^\d+\.\s*/, '')}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Support */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-8 text-center">
          <MessageSquare className="h-10 w-10 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-4">
            Our support team is here to assist you
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/admin/support-tickets')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => navigate('/status')}>
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
