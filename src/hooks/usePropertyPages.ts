
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/property';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePropertyPages = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const createPropertyPage = async (property: Property) => {
    if (!user) return;

    // Generate SEO-friendly slug from the address
    const slug = property.location
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Create SEO-optimized content
    const pageTitle = `${property.title} - ${property.location}`;
    const metaDescription = `Book ${property.title} in ${property.location}. ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, sleeps ${property.maxGuests}. Starting at $${property.pricePerNight}/night.`;
    
    const pageContent = `
# ${property.title}

**Location:** ${property.location}

## Property Details
- **Bedrooms:** ${property.bedrooms}
- **Bathrooms:** ${property.bathrooms}
- **Maximum Guests:** ${property.maxGuests}
- **Price:** $${property.pricePerNight} per night

## Description
${property.description}

${property.amenities ? `## Amenities
${property.amenities}` : ''}

## Book Your Stay
Ready to experience this amazing property? Book now through our secure booking system.

[Book Now](${property.hospitableBookingUrl || '#'})

---

*Located at ${property.location}, this property offers the perfect combination of comfort and convenience for your Eugene getaway.*
    `.trim();

    try {
      const { error } = await supabase
        .from('pages')
        .insert([{
          title: pageTitle,
          slug: `property-${slug}`,
          content: pageContent,
          meta_description: metaDescription,
          is_published: true,
          created_by: user.id
        }]);

      if (error) {
        console.error('Error creating property page:', error);
        toast({
          title: "Warning",
          description: "Property added but page creation failed. You can create it manually later.",
          variant: "destructive"
        });
      } else {
        console.log('Property page created successfully');
      }
    } catch (error) {
      console.error('Error in createPropertyPage:', error);
    }
  };

  return {
    createPropertyPage
  };
};
