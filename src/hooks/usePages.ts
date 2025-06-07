
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const usePages = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPages = async () => {
    console.log('Fetching pages...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching pages:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch pages.',
          variant: 'destructive'
        });
        setPages([]);
        return;
      }

      console.log('Fetched pages:', data);
      console.log('Number of pages found:', data?.length || 0);
      setPages(data || []);
    } catch (error) {
      console.error('Error in fetchPages:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const addPage = async (pageData: any) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create pages.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pages')
        .insert([{
          ...pageData,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create page.',
          variant: 'destructive'
        });
        console.error('Error creating page:', error);
        return;
      }

      setPages(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Page created successfully!'
      });
    } catch (error) {
      console.error('Error in addPage:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    }
  };

  const editPage = async (pageId: string, pageData: any) => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .update(pageData)
        .eq('id', pageId)
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update page.',
          variant: 'destructive'
        });
        console.error('Error updating page:', error);
        return;
      }

      setPages(prev => prev.map(page => 
        page.id === pageId ? data : page
      ));
      toast({
        title: 'Success',
        description: 'Page updated successfully!'
      });
    } catch (error) {
      console.error('Error in editPage:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete page.',
          variant: 'destructive'
        });
        console.error('Error deleting page:', error);
        return;
      }

      setPages(prev => prev.filter(page => page.id !== pageId));
      toast({
        title: 'Success',
        description: 'Page deleted successfully!'
      });
    } catch (error) {
      console.error('Error in deletePage:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    }
  };

  const addSitePages = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add site pages.',
        variant: 'destructive'
      });
      return;
    }

    const sitePages = [
      {
        title: 'Home',
        slug: 'home',
        content: 'Welcome to our real estate platform featuring premium properties in Eugene, Oregon.',
        meta_description: 'Premium real estate properties and rentals in Eugene, Oregon',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Listings',
        slug: 'listings',
        content: 'Browse our collection of available properties for rent and sale.',
        meta_description: 'Property listings for rent and sale in Eugene, Oregon',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Blog',
        slug: 'blog',
        content: 'Read our latest articles about real estate, local news, and property insights.',
        meta_description: 'Real estate blog with insights and local Eugene news',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'About',
        slug: 'about',
        content: 'Learn more about our company and commitment to providing exceptional real estate services.',
        meta_description: 'About our real estate company and services',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Experiences',
        slug: 'experiences',
        content: 'Discover unique local experiences and activities in Eugene, Oregon.',
        meta_description: 'Local experiences and activities in Eugene, Oregon',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'FAQ',
        slug: 'faq',
        content: 'Frequently asked questions about our services and properties.',
        meta_description: 'Frequently asked questions about our real estate services',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: 'Our privacy policy and data protection practices.',
        meta_description: 'Privacy policy and data protection information',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        content: 'Terms and conditions for using our services.',
        meta_description: 'Terms of service and usage conditions',
        is_published: true,
        created_by: user.id
      }
    ];

    try {
      for (const pageData of sitePages) {
        // Check if page with this slug already exists
        const { data: existingPage } = await supabase
          .from('pages')
          .select('id')
          .eq('slug', pageData.slug)
          .single();

        if (!existingPage) {
          const { error } = await supabase
            .from('pages')
            .insert([pageData]);

          if (error) {
            console.error(`Error creating page ${pageData.title}:`, error);
          }
        }
      }

      // Refresh the pages list
      await fetchPages();
      
      toast({
        title: 'Success',
        description: 'Site pages have been added successfully!'
      });
    } catch (error) {
      console.error('Error adding site pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to add some site pages.',
        variant: 'destructive'
      });
    }
  };

  const autoLoadAllPages = async () => {
    if (!user) return;

    // Define all pages that exist in your website routes
    const websitePages = [
      {
        title: 'Home',
        slug: '',
        content: 'Welcome to our real estate platform featuring premium properties in Eugene, Oregon.',
        meta_description: 'Premium real estate properties and rentals in Eugene, Oregon',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Listings',
        slug: 'listings',
        content: 'Browse our collection of available properties for rent and sale.',
        meta_description: 'Property listings for rent and sale in Eugene, Oregon',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Blog',
        slug: 'blog',
        content: 'Read our latest articles about real estate, local news, and property insights.',
        meta_description: 'Real estate blog with insights and local Eugene news',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'About',
        slug: 'about',
        content: 'Learn more about our company and commitment to providing exceptional real estate services.',
        meta_description: 'About our real estate company and services',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Experiences',
        slug: 'experiences',
        content: 'Discover unique local experiences and activities in Eugene, Oregon.',
        meta_description: 'Local experiences and activities in Eugene, Oregon',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'FAQ',
        slug: 'faq',
        content: 'Frequently asked questions about our services and properties.',
        meta_description: 'Frequently asked questions about our real estate services',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: 'Our privacy policy and data protection practices.',
        meta_description: 'Privacy policy and data protection information',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        content: 'Terms and conditions for using our services.',
        meta_description: 'Terms of service and usage conditions',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Search Results',
        slug: 'search',
        content: 'Search results for properties and content.',
        meta_description: 'Search results page for finding properties and content',
        is_published: true,
        created_by: user.id
      },
      {
        title: 'Admin Dashboard',
        slug: 'admin',
        content: 'Administrative dashboard for managing the website.',
        meta_description: 'Admin dashboard for website management',
        is_published: false,
        created_by: user.id
      },
      {
        title: 'Properties Management',
        slug: 'properties',
        content: 'Manage property listings and details.',
        meta_description: 'Property management interface for administrators',
        is_published: false,
        created_by: user.id
      },
      {
        title: 'Page Management',
        slug: 'page-management',
        content: 'Manage website pages and content.',
        meta_description: 'Page management interface for administrators',
        is_published: false,
        created_by: user.id
      },
      {
        title: 'Blog Management',
        slug: 'blog-management',
        content: 'Manage blog posts and articles.',
        meta_description: 'Blog management interface for administrators',
        is_published: false,
        created_by: user.id
      },
      {
        title: 'Site Settings',
        slug: 'site-settings',
        content: 'Configure website settings and preferences.',
        meta_description: 'Site configuration and settings page',
        is_published: false,
        created_by: user.id
      },
      {
        title: 'Admin Profile',
        slug: 'admin/profile',
        content: 'Administrator profile and account settings.',
        meta_description: 'Admin profile and account management',
        is_published: false,
        created_by: user.id
      }
    ];

    try {
      for (const pageData of websitePages) {
        // Check if page with this slug already exists
        const { data: existingPage } = await supabase
          .from('pages')
          .select('id')
          .eq('slug', pageData.slug)
          .maybeSingle();

        if (!existingPage) {
          const { error } = await supabase
            .from('pages')
            .insert([pageData]);

          if (error) {
            console.error(`Error creating page ${pageData.title}:`, error);
          }
        }
      }

      console.log('Auto-loaded all website pages into database');
    } catch (error) {
      console.error('Error auto-loading pages:', error);
    }
  };

  useEffect(() => {
    console.log('usePages effect triggered, user:', user);
    const loadPages = async () => {
      if (user) {
        await autoLoadAllPages();
      }
      await fetchPages();
    };
    loadPages();
  }, [user]);

  return {
    pages,
    loading,
    addPage,
    editPage,
    deletePage,
    addSitePages,
    refetch: fetchPages
  };
};
