import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, MessageSquare, Book, FileQuestion, ExternalLink } from 'lucide-react';
import SupportTicketForm from './SupportTicketForm';
import FeedbackForm from './FeedbackForm';

const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickLinks = [
    { label: 'Getting Started Guide', href: '/admin/help/getting-started', icon: Book },
    { label: 'FAQ', href: '/admin/help/faq', icon: FileQuestion },
    { label: 'Documentation', href: '/admin/help', icon: ExternalLink },
    { label: 'System Status', href: '/admin/status', icon: ExternalLink },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </SheetTitle>
          <SheetDescription>
            Get help, submit feedback, or contact our support team
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="help" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="help">Quick Help</TabsTrigger>
              <TabsTrigger value="ticket">Get Support</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="help" className="mt-4 space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Links</h4>
                {quickLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{link.label}</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Common Questions</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">How do I add a new property?</p>
                    <p className="text-muted-foreground mt-1">
                      Go to Properties → Add Property and fill in the details.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">How do I connect my calendar?</p>
                    <p className="text-muted-foreground mt-1">
                      Edit your property and add your iCal URL in the Calendar Sync section.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">How do I set up a custom domain?</p>
                    <p className="text-muted-foreground mt-1">
                      Go to Settings → Domain and follow the instructions.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ticket" className="mt-4">
              <SupportTicketForm onSuccess={() => setIsOpen(false)} />
            </TabsContent>

            <TabsContent value="feedback" className="mt-4">
              <FeedbackForm onSuccess={() => setIsOpen(false)} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SupportWidget;
