import { CreatePageData } from '@/types/page';

export const getDefaultPages = (userId: string, organizationId: string): CreatePageData[] => [
  {
    title: 'Home',
    slug: '',
    content: `
      <div class="text-center py-16">
        <h1 class="text-4xl font-bold mb-6">Welcome to Our Vacation Rentals</h1>
        <p class="text-xl text-gray-600 mb-8">Experience exceptional stays in our premium properties</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-4">Premium Properties</h3>
            <p>Carefully curated homes for your comfort</p>
          </div>
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-4">Local Experiences</h3>
            <p>Discover the best our area has to offer</p>
          </div>
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-4">Exceptional Service</h3>
            <p>24/7 support for an unforgettable stay</p>
          </div>
        </div>
      </div>
    `,
    meta_description: 'Welcome to our vacation rentals - Premium accommodations for your perfect getaway.',
    is_published: true,
    show_in_nav: false,
    created_by: userId,
    organization_id: organizationId
  },
  {
    title: 'About Us',
    slug: 'about',
    content: `
      <div class="max-w-4xl mx-auto py-12">
        <h1 class="text-4xl font-bold mb-8">About Us</h1>
        <div class="prose prose-lg">
          <p>Welcome to our vacation rentals, where comfort meets adventure. We're passionate about providing exceptional vacation rental experiences.</p>
          
          <h2>Our Story</h2>
          <p>Founded with a vision to create memorable stays for travelers, we have grown from a single property to a collection of carefully curated homes. Each property is selected and maintained to our high standards of comfort, cleanliness, and style.</p>
          
          <h2>Our Mission</h2>
          <p>We believe that where you stay should enhance your travel experience. That's why we go beyond just providing a place to sleep - we create spaces where memories are made, adventures begin, and guests feel truly at home.</p>
          
          <h2>Why Choose Us?</h2>
          <ul>
            <li><strong>Prime Locations:</strong> All our properties are strategically located</li>
            <li><strong>Exceptional Amenities:</strong> From fully equipped kitchens to high-speed Wi-Fi, we provide everything you need</li>
            <li><strong>Local Expertise:</strong> Our team knows the area inside and out</li>
            <li><strong>24/7 Support:</strong> We're always here when you need us</li>
          </ul>
          
          <p>We're here to make your stay exceptional.</p>
        </div>
      </div>
    `,
    meta_description: 'Learn about us - your trusted partner for exceptional vacation rental experiences.',
    is_published: true,
    show_in_nav: false,
    created_by: userId,
    organization_id: organizationId
  },
  {
    title: 'Contact Us',
    slug: 'contact',
    content: `
      <div class="max-w-4xl mx-auto py-12">
        <h1 class="text-4xl font-bold mb-8">Contact Us</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 class="text-2xl font-semibold mb-6">Get in Touch</h2>
            <div class="space-y-4">
              <p>We'd love to hear from you. Reach out with any questions about our properties or your booking.</p>
            </div>
            <div class="mt-8">
              <h3 class="font-semibold mb-2">Support Hours</h3>
              <p>We're available 24/7 for emergencies</p>
              <p>Regular business hours: 9 AM - 6 PM</p>
            </div>
          </div>
          <div>
            <h2 class="text-2xl font-semibold mb-6">How Can We Help?</h2>
            <ul class="space-y-2">
              <li>• Booking assistance and property recommendations</li>
              <li>• Local area information and activity suggestions</li>
              <li>• Support during your stay</li>
              <li>• Questions about amenities and policies</li>
              <li>• Special requests and accommodations</li>
            </ul>
          </div>
        </div>
      </div>
    `,
    meta_description: 'Contact us for booking assistance, local recommendations, and support. Available 24/7 for your needs.',
    is_published: true,
    show_in_nav: false,
    created_by: userId,
    organization_id: organizationId
  },
  {
    title: 'Frequently Asked Questions',
    slug: 'faq',
    content: `
      <div class="space-y-8">
        
        <!-- General Section -->
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-foreground">🏡 General</h2>
          
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">What time is check-in and check-out?</h3>
              <p><strong>Check-in:</strong> 4:00 PM</p>
              <p><strong>Check-out:</strong> 11:00 AM</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are pets allowed?</h3>
              <p>Pet policies vary by property. Please check the specific property listing or contact us for details.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">What are quiet hours?</h3>
              <p>Quiet hours begin at 10:00 PM. Please respect neighbors.</p>
            </div>
          </div>
        </div>

        <!-- Check-In & Security Section -->
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-foreground">🔐 Check-In & Security</h2>
          
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">How do I access the property?</h3>
              <p>Properties use keyless entry systems. You'll receive access instructions prior to your arrival.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Is parking available?</h3>
              <p>Parking availability varies by property. Check your property listing for specific details.</p>
            </div>
          </div>
        </div>

        <!-- Comfort & Amenities Section -->
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-foreground">☕️ Comfort & Amenities</h2>
          
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are linens and towels provided?</h3>
              <p>Yes, along with extra bedding.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Is the kitchen fully equipped?</h3>
              <p>Yes, kitchens include pots, pans, utensils, and basic cooking supplies.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are laundry facilities available?</h3>
              <p>Most properties have washer and dryer. Check your specific listing for details.</p>
            </div>
          </div>
        </div>

        <!-- Guest Support Section -->
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-foreground">🛠 Guest Support</h2>
          
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Who do I contact for help?</h3>
              <p>Contact information is provided in your booking confirmation. We're available 24/7 for emergencies.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Can I request late check-out?</h3>
              <p>Yes, based on availability. Please reach out in advance.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    meta_description: 'Find answers to frequently asked questions including check-in, amenities, and guest support.',
    is_published: true,
    show_in_nav: false,
    created_by: userId,
    organization_id: organizationId
  }
];
