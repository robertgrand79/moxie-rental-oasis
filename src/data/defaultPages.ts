import { CreatePageData } from '@/types/page';

export const getDefaultPages = (userId: string): CreatePageData[] => [
  {
    title: 'Home',
    slug: '',
    content: `
      <div class="text-center py-16">
        <h1 class="text-4xl font-bold mb-6">Welcome to Moxie Vacation Rentals</h1>
        <p class="text-xl text-gray-600 mb-8">Experience the best of Eugene, Oregon with our premium vacation rentals</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-4">Premium Properties</h3>
            <p>Carefully curated homes in the heart of Eugene</p>
          </div>
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-4">Local Experiences</h3>
            <p>Discover the best Eugene has to offer</p>
          </div>
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-4">Exceptional Service</h3>
            <p>24/7 support for an unforgettable stay</p>
          </div>
        </div>
      </div>
    `,
    meta_description: 'Welcome to Moxie Vacation Rentals - Premium vacation rentals in Eugene, Oregon near the University of Oregon.',
    is_published: true,
    created_by: userId
  },
  {
    title: 'About Us',
    slug: 'about',
    content: `
      <div class="max-w-4xl mx-auto py-12">
        <h1 class="text-4xl font-bold mb-8">About Moxie Vacation Rentals</h1>
        <div class="prose prose-lg">
          <p>Welcome to Moxie Vacation Rentals, where comfort meets adventure in the heart of Eugene, Oregon. We're passionate about providing exceptional vacation rental experiences that showcase the best of our beautiful Pacific Northwest city.</p>
          
          <h2>Our Story</h2>
          <p>Founded with a vision to create memorable stays for travelers, Moxie Vacation Rentals has grown from a single property to a collection of carefully curated homes throughout Eugene. Each property is selected and maintained to our high standards of comfort, cleanliness, and style.</p>
          
          <h2>Our Mission</h2>
          <p>We believe that where you stay should enhance your travel experience. That's why we go beyond just providing a place to sleep - we create spaces where memories are made, adventures begin, and guests feel truly at home.</p>
          
          <h2>Why Choose Moxie?</h2>
          <ul>
            <li><strong>Prime Locations:</strong> All our properties are strategically located near the University of Oregon and downtown Eugene</li>
            <li><strong>Exceptional Amenities:</strong> From fully equipped kitchens to high-speed Wi-Fi, we provide everything you need</li>
            <li><strong>Local Expertise:</strong> Our team knows Eugene inside and out and loves sharing insider tips</li>
            <li><strong>24/7 Support:</strong> We're always here when you need us, ensuring peace of mind throughout your stay</li>
          </ul>
          
          <p>Whether you're visiting for a University of Oregon event, exploring the outdoor recreation opportunities, or discovering Eugene's vibrant arts and culture scene, we're here to make your stay exceptional.</p>
        </div>
      </div>
    `,
    meta_description: 'Learn about Moxie Vacation Rentals - your trusted partner for exceptional vacation rental experiences in Eugene, Oregon.',
    is_published: true,
    created_by: userId
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
              <div>
                <h3 class="font-semibold">Primary Contact</h3>
                <p>Gabby: <a href="tel:541-255-1545" class="text-blue-600 hover:underline">541-255-1545</a></p>
                <p>Email: <a href="mailto:gabby@moxievacationrentals.com" class="text-blue-600 hover:underline">gabby@moxievacationrentals.com</a></p>
              </div>
              <div>
                <h3 class="font-semibold">Additional Support</h3>
                <p>Robert: <a href="tel:541-953-7247" class="text-blue-600 hover:underline">541-953-7247</a></p>
                <p>Shelly: <a href="tel:541-221-0608" class="text-blue-600 hover:underline">541-221-0608</a></p>
              </div>
            </div>
            <div class="mt-8">
              <h3 class="font-semibold mb-2">Office Hours</h3>
              <p>We're available 24/7 for emergencies</p>
              <p>Regular business hours: 9 AM - 6 PM PST</p>
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
            <div class="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 class="font-semibold mb-2">Emergency Contact</h3>
              <p class="text-sm">For urgent matters during your stay, please call or text Gabby at 541-255-1545. We respond to emergencies immediately.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    meta_description: 'Contact Moxie Vacation Rentals for booking assistance, local recommendations, and support. Available 24/7 for your needs.',
    is_published: true,
    created_by: userId
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
              <h3 class="font-semibold mb-2">Where are the properties located?</h3>
              <p>All homes are located in Eugene, Oregon, close to the University of Oregon and downtown.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">What time is check-in and check-out?</h3>
              <p><strong>Check-in:</strong> 4:00 PM</p>
              <p><strong>Check-out:</strong> 11:00 AM</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are pets allowed?</h3>
              <p>No pets allowed unless explicitly approved in advance. If approved, a $150 cleaning fee applies.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">What are quiet hours?</h3>
              <p>Quiet hours begin at 10:00 PM. Please respect neighbors and any attached units.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are extra guests allowed?</h3>
              <p>No. Only registered guests are permitted. Each property has a guest limit (typically 2–6).</p>
            </div>
          </div>
        </div>

        <!-- Check-In & Security Section -->
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-foreground">🔐 Check-In & Security</h2>
          
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">How do I access the home?</h3>
              <p>Each home uses a keyless entry system. Enter the code and press the red button to unlock. Press only the red button to lock.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Is parking available?</h3>
              <p>Yes, each home has at least one dedicated parking space. Some also offer free street parking nearby.</p>
            </div>
          </div>
        </div>

        <!-- Wi-Fi Information Section -->
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-foreground">📶 Wi-Fi Information</h2>
          
          <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-4">Wi-Fi credentials for each property:</h3>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse border border-gray-300">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-gray-300 px-4 py-2 text-left">Property</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Wi-Fi Name</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Wi-Fi Password</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">2920 Harris House</td>
                    <td class="border border-gray-300 px-4 py-2">2920Harris</td>
                    <td class="border border-gray-300 px-4 py-2">2920 Harris St</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">2614 Kincaid House</td>
                    <td class="border border-gray-300 px-4 py-2">2614 Kincaid</td>
                    <td class="border border-gray-300 px-4 py-2">2614kincaid#</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">358 W. 10th Studio</td>
                    <td class="border border-gray-300 px-4 py-2">358w10studio</td>
                    <td class="border border-gray-300 px-4 py-2">358w10studio#</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2">358 W. 10th House</td>
                    <td class="border border-gray-300 px-4 py-2">358w10</td>
                    <td class="border border-gray-300 px-4 py-2">358w10th#</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Comfort & Amenities Section -->
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-foreground">☕️ Comfort & Amenities</h2>
          
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Do homes have coffee makers?</h3>
              <p>Yes. Dual-style (Keurig + full pot) with provided K-cups: dark, medium, and decaf.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are linens and towels provided?</h3>
              <p>Yes, along with extra bedding.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are toiletries provided?</h3>
              <p>Yes. Shampoo, conditioner, and body wash are stocked in every bathroom.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Is the kitchen fully equipped?</h3>
              <p>Yes. Includes pots, pans, utensils, spices, blender, waffle maker, grill tools, etc.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are laundry facilities available?</h3>
              <p>Yes. Each home has a washer and dryer, with detergent and dryer sheets included.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Do homes have air conditioning and heat?</h3>
              <p>Yes. Thermostats are pre-set to 68–72°F but are fully adjustable.</p>
            </div>
          </div>
        </div>

        <!-- Entertainment & Tech Section -->
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-foreground">🔊 Entertainment & Tech</h2>
          
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are smart TVs provided?</h3>
              <p>Yes, all TVs offer streaming services like Netflix and Disney+.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are speakers included?</h3>
              <p>Yes. Some homes feature Bose portable speakers or built-in surround sound.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are phone/device chargers provided?</h3>
              <p>Yes. Each bedroom includes charging stations.</p>
            </div>
          </div>
        </div>

        <!-- Outdoor Spaces Section -->
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-foreground">🔥 Outdoor Spaces</h2>
          
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">What outdoor amenities are available?</h3>
              <p>Most homes include patios, fire pits, BBQs, string lighting, and outdoor seating.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Are bikes available?</h3>
              <p>Yes. Harris and Kincaid homes have 6 bikes each, with helmets.</p>
              <ul class="mt-2 space-y-1">
                <li><strong>Harris bike lock code:</strong> 0651</li>
                <li><strong>Kincaid bike lock code:</strong> 0561</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Trash & Housekeeping Section -->
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-foreground">♻️ Trash & Housekeeping</h2>
          
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">How is trash handled?</h3>
              <p>Each house has:</p>
              <ul class="mt-2 space-y-1">
                <li><strong>Trash:</strong> Blue bin</li>
                <li><strong>Recycling:</strong> Green bin</li>
                <li><strong>Yard waste/compost:</strong> Grey bin</li>
                <li><strong>Glass:</strong> Small red bin</li>
              </ul>
              <p class="mt-2"><strong>Trash pickup is Friday.</strong></p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">What should I do at check-out?</h3>
              <ul class="space-y-2">
                <li>• Start the dishwasher</li>
                <li>• Take out all trash and recycling</li>
                <li>• Strip the beds and start a towel load if possible</li>
                <li>• Lock all doors and windows</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Guest Support Section -->
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-foreground">🛠 Guest Support</h2>
          
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Who do I contact for help?</h3>
              <div class="space-y-2">
                <p><strong>Gabby:</strong> 541-255-1545</p>
                <p><strong>Robert:</strong> 541-953-7247</p>
                <p><strong>Shelly:</strong> 541-221-0608</p>
                <p><strong>Email:</strong> gabby@moxievacationrentals.com</p>
              </div>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Can I request late check-out?</h3>
              <p>Yes, based on availability. Please reach out in advance.</p>
            </div>
            
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-2">Is mid-stay housekeeping available?</h3>
              <p>Yes, upon request.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    meta_description: 'Find answers to frequently asked questions about Moxie Vacation Rentals including check-in, amenities, Wi-Fi, and guest support.',
    is_published: true,
    created_by: userId
  }
];
