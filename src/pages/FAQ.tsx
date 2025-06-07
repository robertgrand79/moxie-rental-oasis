import React from 'react';
import Footer from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Frequently Asked Questions</h1>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {/* General Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">🏡 General</h2>
              
              <AccordionItem value="location">
                <AccordionTrigger>Where are the properties located?</AccordionTrigger>
                <AccordionContent>
                  All homes are located in Eugene, Oregon, close to the University of Oregon and downtown.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="checkin-checkout">
                <AccordionTrigger>What time is check-in and check-out?</AccordionTrigger>
                <AccordionContent>
                  <p><strong>Check-in:</strong> 4:00 PM</p>
                  <p><strong>Check-out:</strong> 11:00 AM</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pets">
                <AccordionTrigger>Are pets allowed?</AccordionTrigger>
                <AccordionContent>
                  No pets allowed unless explicitly approved in advance. If approved, a $150 cleaning fee applies.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="quiet-hours">
                <AccordionTrigger>What are quiet hours?</AccordionTrigger>
                <AccordionContent>
                  Quiet hours begin at 10:00 PM. Please respect neighbors and any attached units.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="extra-guests">
                <AccordionTrigger>Are extra guests allowed?</AccordionTrigger>
                <AccordionContent>
                  No. Only registered guests are permitted. Each property has a guest limit (typically 2–6).
                </AccordionContent>
              </AccordionItem>
            </div>

            {/* Check-In & Security Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">🔐 Check-In & Security</h2>
              
              <AccordionItem value="access">
                <AccordionTrigger>How do I access the home?</AccordionTrigger>
                <AccordionContent>
                  Each home uses a keyless entry system. Enter the code and press the red button to unlock. Press only the red button to lock.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="parking">
                <AccordionTrigger>Is parking available?</AccordionTrigger>
                <AccordionContent>
                  Yes, each home has at least one dedicated parking space. Some also offer free street parking nearby.
                </AccordionContent>
              </AccordionItem>
            </div>

            {/* Wi-Fi Information Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">📶 Wi-Fi Information</h2>
              
              <AccordionItem value="wifi">
                <AccordionTrigger>What are the Wi-Fi credentials for each property?</AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border px-4 py-2 text-left">Property</th>
                          <th className="border border-border px-4 py-2 text-left">Wi-Fi Name</th>
                          <th className="border border-border px-4 py-2 text-left">Wi-Fi Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border px-4 py-2">2920 Harris House</td>
                          <td className="border border-border px-4 py-2">2920Harris</td>
                          <td className="border border-border px-4 py-2">2920 Harris St</td>
                        </tr>
                        <tr>
                          <td className="border border-border px-4 py-2">2614 Kincaid House</td>
                          <td className="border border-border px-4 py-2">2614 Kincaid</td>
                          <td className="border border-border px-4 py-2">2614kincaid#</td>
                        </tr>
                        <tr>
                          <td className="border border-border px-4 py-2">358 W. 10th Studio</td>
                          <td className="border border-border px-4 py-2">358w10studio</td>
                          <td className="border border-border px-4 py-2">358w10studio#</td>
                        </tr>
                        <tr>
                          <td className="border border-border px-4 py-2">358 W. 10th House</td>
                          <td className="border border-border px-4 py-2">358w10</td>
                          <td className="border border-border px-4 py-2">358w10th#</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </div>

            {/* Comfort & Amenities Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">☕️ Comfort & Amenities</h2>
              
              <AccordionItem value="coffee">
                <AccordionTrigger>Do homes have coffee makers?</AccordionTrigger>
                <AccordionContent>
                  Yes. Dual-style (Keurig + full pot) with provided K-cups: dark, medium, and decaf.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="linens">
                <AccordionTrigger>Are linens and towels provided?</AccordionTrigger>
                <AccordionContent>
                  Yes, along with extra bedding.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="toiletries">
                <AccordionTrigger>Are toiletries provided?</AccordionTrigger>
                <AccordionContent>
                  Yes. Shampoo, conditioner, and body wash are stocked in every bathroom.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="kitchen">
                <AccordionTrigger>Is the kitchen fully equipped?</AccordionTrigger>
                <AccordionContent>
                  Yes. Includes pots, pans, utensils, spices, blender, waffle maker, grill tools, etc.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="laundry">
                <AccordionTrigger>Are laundry facilities available?</AccordionTrigger>
                <AccordionContent>
                  Yes. Each home has a washer and dryer, with detergent and dryer sheets included.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="climate">
                <AccordionTrigger>Do homes have air conditioning and heat?</AccordionTrigger>
                <AccordionContent>
                  Yes. Thermostats are pre-set to 68–72°F but are fully adjustable.
                </AccordionContent>
              </AccordionItem>
            </div>

            {/* Entertainment & Tech Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">🔊 Entertainment & Tech</h2>
              
              <AccordionItem value="tvs">
                <AccordionTrigger>Are smart TVs provided?</AccordionTrigger>
                <AccordionContent>
                  Yes, all TVs offer streaming services like Netflix and Disney+.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="speakers">
                <AccordionTrigger>Are speakers included?</AccordionTrigger>
                <AccordionContent>
                  Yes. Some homes feature Bose portable speakers or built-in surround sound.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="chargers">
                <AccordionTrigger>Are phone/device chargers provided?</AccordionTrigger>
                <AccordionContent>
                  Yes. Each bedroom includes charging stations.
                </AccordionContent>
              </AccordionItem>
            </div>

            {/* Outdoor Spaces Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">🔥 Outdoor Spaces</h2>
              
              <AccordionItem value="outdoor-amenities">
                <AccordionTrigger>What outdoor amenities are available?</AccordionTrigger>
                <AccordionContent>
                  Most homes include patios, fire pits, BBQs, string lighting, and outdoor seating.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bikes">
                <AccordionTrigger>Are bikes available?</AccordionTrigger>
                <AccordionContent>
                  <p>Yes. Harris and Kincaid homes have 6 bikes each, with helmets.</p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>Harris bike lock code:</strong> 0651</li>
                    <li><strong>Kincaid bike lock code:</strong> 0561</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </div>

            {/* Trash & Housekeeping Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">♻️ Trash & Housekeeping</h2>
              
              <AccordionItem value="trash">
                <AccordionTrigger>How is trash handled?</AccordionTrigger>
                <AccordionContent>
                  <p>Each house has:</p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>Trash:</strong> Blue bin</li>
                    <li><strong>Recycling:</strong> Green bin</li>
                    <li><strong>Yard waste/compost:</strong> Grey bin</li>
                    <li><strong>Glass:</strong> Small red bin</li>
                  </ul>
                  <p className="mt-2"><strong>Trash pickup is Friday.</strong></p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="checkout-tasks">
                <AccordionTrigger>What should I do at check-out?</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    <li>• Start the dishwasher</li>
                    <li>• Take out all trash and recycling</li>
                    <li>• Strip the beds and start a towel load if possible</li>
                    <li>• Lock all doors and windows</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </div>

            {/* Guest Support Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">🛠 Guest Support</h2>
              
              <AccordionItem value="contact">
                <AccordionTrigger>Who do I contact for help?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p><strong>Gabby:</strong> 541-255-1545</p>
                    <p><strong>Robert:</strong> 541-953-7247</p>
                    <p><strong>Shelly:</strong> 541-221-0608</p>
                    <p><strong>Email:</strong> gabby@moxievacationrentals.com</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="late-checkout">
                <AccordionTrigger>Can I request late check-out?</AccordionTrigger>
                <AccordionContent>
                  Yes, based on availability. Please reach out in advance.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="housekeeping">
                <AccordionTrigger>Is mid-stay housekeeping available?</AccordionTrigger>
                <AccordionContent>
                  Yes, upon request.
                </AccordionContent>
              </AccordionItem>
            </div>
          </Accordion>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Can't find what you're looking for? Contact us at gabby@moxievacationrentals.com or call 541-255-1545.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
