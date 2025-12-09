import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import GuidebookEditor from '@/components/guest-experience/guidebook/GuidebookEditor';
import { useGuidebook, useCreateGuidebook, useUpdateGuidebook, GuidebookContent } from '@/hooks/useGuidebookManagement';

const GuidebookEditorPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();

  // Fetch property details
  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location')
        .eq('id', propertyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
  });

  // Fetch existing guidebook
  const { data: guidebook, isLoading: guidebookLoading } = useGuidebook(propertyId);

  const createGuidebook = useCreateGuidebook();
  const updateGuidebook = useUpdateGuidebook();

  const handleSave = async (content: GuidebookContent, title: string) => {
    if (!propertyId) return;

    if (guidebook) {
      // Update existing
      await updateGuidebook.mutateAsync({
        id: guidebook.id,
        propertyId,
        title,
        content,
        is_active: true
      });
    } else {
      // Create new
      await createGuidebook.mutateAsync({
        propertyId,
        title,
        content
      });
    }
    
    navigate('/admin/host/analytics', { state: { tab: 'guidebooks' } });
  };

  const handleCancel = () => {
    navigate('/admin/host/analytics', { state: { tab: 'guidebooks' } });
  };

  const isLoading = propertyLoading || guidebookLoading;
  const isSaving = createGuidebook.isPending || updateGuidebook.isPending;

  if (isLoading) {
    return (
      <AdminPageWrapper title="Loading..." description="Loading guidebook editor">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminPageWrapper>
    );
  }

  if (!property) {
    return (
      <AdminPageWrapper title="Property Not Found" description="The requested property could not be found">
        <div className="p-6">
          <p className="text-muted-foreground">Property not found. Please go back and try again.</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Guidebook Editor"
      description={`Create or edit the digital guidebook for ${property.title}`}
    >
      <div className="p-6">
        <GuidebookEditor
          initialContent={guidebook?.content}
          propertyTitle={property.title}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      </div>
    </AdminPageWrapper>
  );
};

export default GuidebookEditorPage;
