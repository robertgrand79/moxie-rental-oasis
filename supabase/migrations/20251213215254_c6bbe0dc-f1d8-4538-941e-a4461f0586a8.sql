-- Create property_documents table for PDF storage and AI knowledge
CREATE TABLE public.property_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  extracted_text TEXT,
  document_type TEXT DEFAULT 'general',
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Organization members can view property documents"
ON public.property_documents
FOR SELECT
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Organization admins can manage property documents"
ON public.property_documents
FOR ALL
USING (user_is_org_admin(auth.uid(), organization_id));

-- Public can read extracted text for AI context (no file access)
CREATE POLICY "Public can read document text for AI"
ON public.property_documents
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_property_documents_property ON public.property_documents(property_id);
CREATE INDEX idx_property_documents_org ON public.property_documents(organization_id);

-- Add trigger for updated_at
CREATE TRIGGER update_property_documents_updated_at
BEFORE UPDATE ON public.property_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();