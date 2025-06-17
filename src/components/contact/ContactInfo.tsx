
import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';

const ContactInfo = () => {
  const { settings } = useStableSiteSettings();

  const contactEmail = settings.contactEmail || 'hello@moxievacationrentals.com';
  const phone = settings.phone || '(541) 555-0123';
  const address = settings.address || '2472 Willamette Street, Eugene, OR 97405';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Get in touch with us. We're here to help!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Phone className="h-5 w-5 text-primary" />
              <span className="font-medium">Phone</span>
              <span className="text-gray-600">{phone}</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <Mail className="h-5 w-5 text-primary" />
              <span className="font-medium">Email</span>
              <span className="text-gray-600">{contactEmail}</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">Address</span>
              <span className="text-gray-600 text-center">
                {address}
              </span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Business Hours</span>
              <span className="text-gray-600 text-center">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday - Sunday: 10:00 AM - 4:00 PM
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfo;
