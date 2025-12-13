import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PropertyDocument {
  id: string;
  property_id: string | null;
  organization_id: string;
  title: string;
  file_path: string;
  extracted_text: string | null;
  document_type: string;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

export function usePropertyDocuments(propertyId: string | undefined, organizationId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['property-documents', propertyId, organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      let query = supabase
        .from('property_documents')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as PropertyDocument[];
    },
    enabled: !!organizationId,
  });

  const uploadDocument = useCallback(async (
    file: File, 
    title: string, 
    documentType: string,
    propertyIdToUse?: string
  ) => {
    if (!organizationId) {
      toast({ title: 'Error', description: 'Organization not found', variant: 'destructive' });
      return null;
    }

    setIsUploading(true);
    
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationId}/${propertyIdToUse || 'org'}/${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('property-documents')
        .upload(fileName, file);
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      // Create document record
      const { data: docData, error: insertError } = await supabase
        .from('property_documents')
        .insert({
          property_id: propertyIdToUse || null,
          organization_id: organizationId,
          title,
          file_path: fileName,
          document_type: documentType,
          file_size: file.size,
        })
        .select()
        .single();
      
      if (insertError) {
        throw new Error(`Failed to save document: ${insertError.message}`);
      }
      
      // Trigger text extraction
      try {
        await supabase.functions.invoke('parse-property-document', {
          body: { documentId: docData.id, filePath: fileName }
        });
      } catch (parseError) {
        console.warn('Text extraction failed, document still saved:', parseError);
      }
      
      toast({ title: 'Success', description: 'Document uploaded successfully' });
      queryClient.invalidateQueries({ queryKey: ['property-documents'] });
      
      return docData as PropertyDocument;
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to upload document', 
        variant: 'destructive' 
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [organizationId, toast, queryClient]);

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const doc = documents?.find(d => d.id === documentId);
      if (!doc) throw new Error('Document not found');
      
      // Delete from storage
      await supabase.storage
        .from('property-documents')
        .remove([doc.file_path]);
      
      // Delete record
      const { error } = await supabase
        .from('property_documents')
        .delete()
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Document deleted' });
      queryClient.invalidateQueries({ queryKey: ['property-documents'] });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to delete document', 
        variant: 'destructive' 
      });
    },
  });

  const updateDocumentText = useMutation({
    mutationFn: async ({ documentId, extractedText }: { documentId: string; extractedText: string }) => {
      const { error } = await supabase
        .from('property_documents')
        .update({ extracted_text: extractedText })
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Document text updated' });
      queryClient.invalidateQueries({ queryKey: ['property-documents'] });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to update document', 
        variant: 'destructive' 
      });
    },
  });

  return {
    documents: documents || [],
    isLoading,
    isUploading,
    uploadDocument,
    deleteDocument: deleteDocument.mutate,
    updateDocumentText: updateDocumentText.mutate,
  };
}
