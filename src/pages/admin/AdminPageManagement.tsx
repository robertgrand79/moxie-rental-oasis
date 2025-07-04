
import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import EnhancedPageForm from '@/components/EnhancedPageForm';
import EnhancedPageList from '@/components/EnhancedPageList';
import PageTemplateSelector from '@/components/PageTemplateSelector';
import EmptyPageState from '@/components/EmptyPageState';
import { usePages } from '@/hooks/usePages';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import LoadingState from '@/components/ui/loading-state';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminPageManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { pages, loading, addPage, editPage, deletePage } = usePages();

  // Check for action parameter and auto-open add form
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setShowTemplateSelector(true);
      setEditingPage(null);
      // Clear the parameter from URL
      setSearchParams(prev => {
        prev.delete('action');
        return prev;
      });
    }
  }, [searchParams, setSearchParams]);

  const handleAddPage = () => {
    setShowTemplateSelector(true);
    setEditingPage(null);
  };

  const handleSelectTemplate = (template: any) => {
    setEditingPage({
      title: template.name,
      slug: template.slug,
      content: template.content,
      meta_description: template.description,
      is_published: false
    });
    setShowTemplateSelector(false);
    setShowAddForm(true);
  };

  const handleStartBlank = () => {
    setEditingPage(null);
    setShowTemplateSelector(false);
    setShowAddForm(true);
  };

  const handleEditPage = (page: any) => {
    setEditingPage(page);
    setShowAddForm(true);
    setShowTemplateSelector(false);
  };

  const handleFormSubmit = (data: any) => {
    if (editingPage && editingPage.id) {
      editPage(editingPage.id, data);
    } else {
      addPage(data);
    }
    setShowAddForm(false);
    setShowTemplateSelector(false);
    setEditingPage(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setShowTemplateSelector(false);
    setEditingPage(null);
  };

  // State reset handler for sidebar navigation
  const resetToDefaultState = useCallback(() => {
    setShowAddForm(false);
    setShowTemplateSelector(false);
    setEditingPage(null);
  }, []);

  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ onReset: resetToDefaultState });

  if (loading) {
    return <LoadingState variant="page" message="Loading your pages..." />;
  }

  const pageActions = (!showAddForm && !showTemplateSelector) ? (
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
      description={`Create and manage your website pages with rich content editor (${pages.length} pages total)`}
      actions={pageActions}
    >
      <div className="p-8">
        {showTemplateSelector && (
          <div className="mb-8 animate-scale-in">
            <PageTemplateSelector
              onSelectTemplate={handleSelectTemplate}
              onStartBlank={handleStartBlank}
            />
            <div className="mt-4 text-center">
              <button
                onClick={handleFormCancel}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="mb-8 animate-scale-in">
            <EnhancedPageForm 
              page={editingPage}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {!showAddForm && !showTemplateSelector && (
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            {pages.length > 0 ? (
              <EnhancedPageList
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

export default AdminPageManagement;
