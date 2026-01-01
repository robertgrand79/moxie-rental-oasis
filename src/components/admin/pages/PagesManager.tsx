import React, { useState } from 'react';
import { Plus, FileText, Eye, Archive, Info, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePages } from '@/hooks/usePages';
import PagesGrid from './PagesGrid';
import PagesListView from './PagesListView';
import PagesViewToggle from './PagesViewToggle';
import PageFormDialog from './PageFormDialog';

const PagesManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  const { pages, loading, addPage, editPage, deletePage } = usePages();

  const statusCategories = [
    { value: 'all', label: 'All Pages', icon: FileText },
    { value: 'published', label: 'Published', icon: Eye },
    { value: 'draft', label: 'Drafts', icon: Archive },
  ];

  const filteredPages = selectedStatus === 'all' 
    ? pages 
    : pages.filter(page => 
        selectedStatus === 'published' ? page.is_published : !page.is_published
      );

  const handleEdit = (page: any) => {
    setEditingPage(page);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingPage(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPage(null);
  };

  const handleSubmit = (data: any) => {
    if (editingPage) {
      editPage(editingPage.id, data);
    } else {
      addPage(data);
    }
    handleCloseForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold">Custom Pages</CardTitle>
              <p className="text-muted-foreground">
                Create additional custom pages like house rules, local guides, or FAQs ({pages.length} pages total)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PagesViewToggle view={view} onViewChange={setView} />
              <Button 
                onClick={handleAddNew}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Page
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Create custom pages for content like house rules, local guides, or special information. 
              Core site pages (About, Contact, etc.) are managed in{' '}
              <Link to="/admin/settings/about" className="font-medium underline hover:text-blue-900">
                Settings → About
              </Link>.
            </AlertDescription>
          </Alert>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-3 h-auto">
              {statusCategories.map((category) => (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="flex items-center justify-center gap-2 px-2 py-3 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <category.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedStatus} className="mt-6">
              {view === 'grid' ? (
                <PagesGrid 
                  pages={filteredPages}
                  onEdit={handleEdit}
                  onDelete={deletePage}
                />
              ) : (
                <PagesListView 
                  pages={filteredPages}
                  onEdit={handleEdit}
                  onDelete={deletePage}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isFormOpen && (
        <PageFormDialog
          page={editingPage}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}
    </>
  );
};

export default PagesManager;