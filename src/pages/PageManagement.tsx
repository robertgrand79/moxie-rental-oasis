
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PageForm from '@/components/PageForm';
import PageList from '@/components/PageList';
import EmptyPageState from '@/components/EmptyPageState';
import { usePages } from '@/hooks/usePages';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard, EnhancedCardContent } from '@/components/ui/enhanced-card';
import LoadingState from '@/components/ui/loading-state';

const PageManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const { pages, loading, addPage, editPage, deletePage } = usePages();

  console.log('PageManagement render - pages:', pages, 'loading:', loading, 'pages length:', pages.length);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <div className="container mx-auto px-4 py-8">
        <EnhancedCard variant="glass" className="mx-auto animate-fade-in">
          <EnhancedCardContent className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Page Management
                </h1>
                <p className="text-gray-600 mt-2">Manage your website pages and content ({pages.length} pages total)</p>
              </div>
              {!showAddForm && (
                <EnhancedButton 
                  onClick={handleAddPage} 
                  variant="gradient"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add Page
                </EnhancedButton>
              )}
            </div>

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
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    </div>
  );
};

export default PageManagement;
