
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PageForm from '@/components/PageForm';
import PageList from '@/components/PageList';
import EmptyPageState from '@/components/EmptyPageState';
import { usePages } from '@/hooks/usePages';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import LoadingState from '@/components/ui/loading-state';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

const AdminPageManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { pages, loading, addPage, editPage, deletePage } = usePages();

  // Check for action parameter and auto-open add form
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setShowAddForm(true);
      setEditingPage(null);
      // Clear the parameter from URL
      setSearchParams(prev => {
        prev.delete('action');
        return prev;
      });
    }
  }, [searchParams, setSearchParams]);

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
      description={`Manage your website pages and content (${pages.length} pages total)`}
      actions={pageActions}
    >
      <div className="p-8">
        {showAddForm && (
          <div className="mb-8 animate-scale-in">
            <PageForm 
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

export default AdminPageManagement;
