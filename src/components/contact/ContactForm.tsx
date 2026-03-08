
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingSelect, FloatingSelectItem } from '@/components/ui/floating-select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { validateInput, sanitizeFormInput } from '@/utils/security';
import { useTenant } from '@/contexts/TenantContext';

const ContactForm = () => {
  const { tenantId } = useTenant();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation and sanitization
    const sanitizedName = sanitizeFormInput(formData.name, 'name');
    const sanitizedEmail = sanitizeFormInput(formData.email, 'email');
    const sanitizedMessage = sanitizeFormInput(formData.message, 'message');
    const sanitizedPhone = sanitizeFormInput(formData.phone, 'phone');
    const sanitizedSubject = sanitizeFormInput(formData.subject, 'subject');

    // Validate inputs
    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (!validateInput.email(sanitizedEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    if (!validateInput.name(sanitizedName)) {
      toast({
        title: 'Invalid Name',
        description: 'Name should contain only letters, spaces, hyphens, and apostrophes.',
        variant: 'destructive'
      });
      return;
    }

    if (!validateInput.message(sanitizedMessage)) {
      toast({
        title: 'Invalid Message',
        description: 'Message should be at least 10 characters and not contain harmful content.',
        variant: 'destructive'
      });
      return;
    }

    if (sanitizedPhone && !validateInput.phoneNumber(sanitizedPhone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: sanitizedName,
          email: sanitizedEmail,
          phone: sanitizedPhone || undefined,
          message: `Subject: ${sanitizedSubject || 'General Inquiry'}\n\n${sanitizedMessage}`
        }
      });

      if (error) throw error;
      
      toast({
        title: 'Message Sent!',
        description: 'Thank you for your message. We\'ll get back to you soon.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput
            label="Full Name *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
          
          <FloatingInput
            label="Email Address *"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
          
          <FloatingSelect
            label="Subject"
            value={formData.subject}
            onValueChange={(value) => handleInputChange('subject', value)}
          >
            <FloatingSelectItem value="booking">Booking Inquiry</FloatingSelectItem>
            <FloatingSelectItem value="general">General Question</FloatingSelectItem>
            <FloatingSelectItem value="support">Guest Support</FloatingSelectItem>
            <FloatingSelectItem value="partnership">Partnership</FloatingSelectItem>
            <FloatingSelectItem value="other">Other</FloatingSelectItem>
          </FloatingSelect>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            placeholder="Tell us how we can help you..."
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={6}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Sending...'
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;
