
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/property';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { generateAddressSlug } from '@/utils/addressSlug';

export const usePropertyPages = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();

  const createPropertyPage = async (property: Property) => {
    if (!user || !organization?.id) return;

    // Generate clean SEO-friendly slug without property ID
    const slug = generateAddressSlug(property.location);

    // Create SEO-optimized content
    const pageTitle = `${property.title} - ${property.location}`;
    const metaDescription = `Book ${property.title} in ${property.location}. ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, sleeps ${property.max_guests}. Starting at $${property.price_per_night}/night.`;
    
    const pageContent = `
# ${property.title}

**Location:** ${property.location}

## Property Details
- **Bedrooms:** ${property.bedrooms}
- **Bathrooms:** ${property.bathrooms}
- **Maximum Guests:** ${property.max_guests}
- **Price:** $${property.price_per_night} per night

## Description
${property.description}

${property.amenities ? `## Amenities
${property.amenities}` : ''}

## Book Your Stay
Ready to experience this amazing property? Book now through our secure booking system.

[Book Now](/book/${slug})

---

*Located at ${property.location}, this property offers the perfect combination of comfort and convenience for your getaway.*
    `.trim();

    try {
      const { error } = await supabase
        .from('pages')
        .insert([{
          title: pageTitle,
          slug: slug,
          content: pageContent,
          meta_description: metaDescription,
          is_published: true,
          created_by: user.id,
          organization_id: organization.id
        }]);

      if (error) {
        console.error('Error creating property page:', error);
        toast({
          title: "Warning",
          description: "Property added but page creation failed. You can create it manually later.",
          variant: "destructive"
        });
      } else {
        console.log('Property page created successfully with slug:', slug);
      }
    } catch (error) {
      console.error('Error in createPropertyPage:', error);
    }
  };

  const deletePropertyPage = async (property: Property) => {
    if (!user) return;

    try {
      // Generate the same clean slug that was used during creation
      const pageSlug = generateAddressSlug(property.location);

      console.log('Attempting to delete page with slug:', pageSlug);

      // Delete the corresponding page
      const { error, data } = await supabase
        .from('pages')
        .delete()
        .eq('slug', pageSlug)
        .select();

      if (error) {
        console.error('Error deleting property page:', error);
        toast({
          title: "Warning",
          description: "Property deleted but page cleanup failed. You may need to manually remove the page.",
          variant: "destructive"
        });
        return false;
      } else {
        console.log('Property page deleted successfully:', data);
        return true;
      }
    } catch (error) {
      console.error('Error in deletePropertyPage:', error);
      return false;
    }
  };

  return {
    createPropertyPage,
    deletePropertyPage
  };
};
