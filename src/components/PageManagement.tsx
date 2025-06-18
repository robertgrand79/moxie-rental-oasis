
import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import EnhancedPageForm from '@/components/EnhancedPageForm';
import PageList from '@/components/PageList';
import EmptyPageState from '@/components/EmptyPageState';
import { usePages } from '@/hooks/usePages';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import LoadingState from '@/components/ui/loading-state';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { toast } from '@/hooks/use-toast';

const PageManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const { pages, loading, addPage, editPage, deletePage } = usePages();

  console.log('PageManagement render - pages:', pages, 'loading:', loading, 'pages length:', pages.length);

  // Check for duplicate Home pages and auto-remove the one with 'home' slug
  useEffect(() => {
    if (pages.length > 0) {
      const homePages = pages.filter(page => 
        page.title.toLowerCase() === 'home' || 
        page.slug === 'home' || 
        page.slug === ''
      );
      
      if (homePages.length > 1) {
        const duplicateHomePage = homePages.find(page => page.slug === 'home');
        if (duplicateHomePage) {
          console.log('Found duplicate Home page with slug "home", removing...', duplicateHomePage);
          deletePage(duplicateHomePage.id);
          toast({
            title: 'Duplicate Removed',
            description: 'Removed duplicate Home page with "home" slug to avoid confusion.',
          });
        }
      }
    }
  }, [pages, deletePage]);

  const handleAddPage = () => {
    setShowAddForm(true);
    setEditingPage(null);
  };

  const handleEditPage = (page: any) => {
    setEditingPage(page);
    setShowAddForm(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingPage) {
      editPage(editingPage.id, data);
    } else {
      addPage(data);
    }
    setShowAddForm(false);
    setEditingPage(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingPage(null);
  };

  if (loading) {
    return <LoadingState variant="page" message="Loading your pages..." />;
  }

  const pageActions = !showAddForm ? (
    <EnhancedButton 
      onClick={handleAddPage} 
      variant="gradient"
      icon={<Plus className="h-4 w-4" />}
    >
      Add Page
    </EnhancedButton>
  ) : null;

  return (
    <AdminPageWrapper
      title="Page Management"
      description={`Manage your website pages with enhanced content editor (${pages.length} pages total)`}
      actions={pageActions}
    >
      <div className="p-8">
        {showAddForm && (
          <div className="mb-8 animate-scale-in">
            <EnhancedPageForm 
              page={editingPage}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {!showAddForm && (
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            {pages.length > 0 ? (
              <PageList
                pages={pages}
                onEdit={handleEditPage}
                onDelete={deletePage}
              />
            ) : (
              <EmptyPageState onAddPage={handleAddPage} />
            )}
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
};

export default PageManagement;
