
import React from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ContactInfo = () => {
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
              <span className="text-gray-600">(541) 555-0123</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <Mail className="h-5 w-5 text-primary" />
              <span className="font-medium">Email</span>
              <span className="text-gray-600">hello@moxievacationrentals.com</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">Address</span>
              <span className="text-gray-600 text-center">
                2472 Willamette Street<br />
                Eugene, OR 97405
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

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Follow Us</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-6">
            <a 
              href="#" 
              className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="flex items-center justify-center w-10 h-10 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="flex items-center justify-center w-10 h-10 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfo;
