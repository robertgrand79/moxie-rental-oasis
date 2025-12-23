import { useState } from 'react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { usePropertyDocuments, PropertyDocument } from '@/hooks/usePropertyDocuments';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Upload, FileText, Trash2, Eye, Edit2, Building2, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DOCUMENT_TYPES = [
  { value: 'house_manual', label: 'House Manual' },
  { value: 'local_guide', label: 'Local Area Guide' },
  { value: 'policies', label: 'Policies & Rules' },
  { value: 'amenities', label: 'Amenities Guide' },
  { value: 'faq', label: 'FAQ Document' },
  { value: 'general', label: 'General Information' },
];

export function PropertyDocumentsTab() {
  const { organization } = useCurrentOrganization();
  const { properties } = usePropertyFetch();
  const { documents, isLoading, isUploading, uploadDocument, deleteDocument, updateDocumentText, reparseDocument, isReparsing, reparsingDocId } = 
    usePropertyDocuments(undefined, organization?.id);
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<PropertyDocument | null>(null);
  const [viewingDoc, setViewingDoc] = useState<PropertyDocument | null>(null);
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('general');
  const [uploadPropertyId, setUploadPropertyId] = useState<string>('org');
  
  // Edit form state
  const [editText, setEditText] = useState('');

  const filteredDocuments = selectedPropertyId === 'all' 
    ? documents 
    : selectedPropertyId === 'org'
      ? documents.filter(d => !d.property_id)
      : documents.filter(d => d.property_id === selectedPropertyId);

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle) return;
    
    const result = await uploadDocument(
      uploadFile, 
      uploadTitle, 
      uploadType,
      uploadPropertyId === 'org' ? undefined : uploadPropertyId
    );
    
    if (result) {
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadType('general');
      setUploadPropertyId('org');
    }
  };

  const handleEditSave = () => {
    if (!editingDoc) return;
    updateDocumentText({ documentId: editingDoc.id, extractedText: editText });
    setEditingDoc(null);
    setEditText('');
  };

  const startEdit = (doc: PropertyDocument) => {
    setEditingDoc(doc);
    setEditText(doc.extracted_text || '');
  };

  const getPropertyName = (propertyId: string | null) => {
    if (!propertyId) return 'Organization-wide';
    const property = properties.find(p => p.id === propertyId);
    return property?.title || 'Unknown Property';
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const needsReparse = (doc: PropertyDocument) => {
    return !doc.extracted_text || doc.extracted_text.length < 500;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Knowledge Documents</CardTitle>
              <CardDescription>
                Upload PDF documents, house manuals, and guides to enhance your AI assistant's knowledge
              </CardDescription>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>File</Label>
                    <Input
                      type="file"
                      accept=".pdf,.txt,.md,.docx"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported: PDF, TXT, MD, DOCX (max 10MB)
                    </p>
                  </div>
                  
                  <div>
                    <Label>Document Title</Label>
                    <Input
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g., House Manual - Beach House"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Document Type</Label>
                    <Select value={uploadType} onValueChange={setUploadType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Apply To</Label>
                    <Select value={uploadPropertyId} onValueChange={setUploadPropertyId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="org">
                          <span className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            All Properties (Organization-wide)
                          </span>
                        </SelectItem>
                        {properties.map(property => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleUpload} 
                    disabled={!uploadFile || !uploadTitle || isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading & Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter */}
          <div className="mb-4">
            <Label>Filter by Property</Label>
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="w-64 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="org">Organization-wide Only</SelectItem>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Documents list */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload PDFs or text documents to enhance your AI assistant's knowledge</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${needsReparse(doc) ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-8 w-8 text-primary mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{doc.title}</h4>
                        {needsReparse(doc) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Low or no text extracted. Try re-parsing with OCR.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type}
                          {' • '}
                          {getPropertyName(doc.property_id)}
                        </p>
                        <p>
                          {formatFileSize(doc.file_size)}
                          {' • '}
                          Uploaded {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                          {doc.extracted_text ? (
                            <span className={doc.extracted_text.length < 500 ? 'text-amber-600 ml-2' : 'text-green-600 ml-2'}>
                              {doc.extracted_text.length < 500 ? '⚠' : '✓'} {doc.extracted_text.length.toLocaleString()} chars extracted
                            </span>
                          ) : (
                            <span className="text-red-500 ml-2">✗ No text extracted</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => reparseDocument(doc.id)}
                            disabled={isReparsing && reparsingDocId === doc.id}
                          >
                            {isReparsing && reparsingDocId === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Re-parse with OCR</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingDoc(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(doc)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this document?')) {
                          deleteDocument(doc.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingDoc?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Label className="text-muted-foreground">Extracted Text (used by AI)</Label>
            <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
              {viewingDoc?.extracted_text || 'No text extracted. Click Edit to add content manually.'}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingDoc} onOpenChange={() => setEditingDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Document Content</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Document: {editingDoc?.title}</Label>
              <p className="text-sm text-muted-foreground">
                Edit the extracted text that the AI assistant will use. You can add, modify, or correct any content.
              </p>
            </div>
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Enter or paste document content here..."
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingDoc(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
