
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageForm from '@/components/PageForm';
import PageList from '@/components/PageList';
import EmptyPageState from '@/components/EmptyPageState';
import { usePages } from '@/hooks/usePages';

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mx-auto border border-white/20">
            <div className="text-center py-8">
              <p className="text-gray-600">Loading pages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mx-auto border border-white/20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Page Management</h1>
              <p className="text-gray-600 mt-2">Manage your website pages and content ({pages.length} pages total)</p>
            </div>
            {!showAddForm && (
              <Button onClick={handleAddPage} className="flex items-center bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-from/90 hover:to-gradient-accent-from/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Page
              </Button>
            )}
          </div>

          {showAddForm && (
            <div className="mb-8">
              <PageForm 
                page={editingPage}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          {!showAddForm && (
            <>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Debug info: Found {pages.length} pages in database
                  {pages.length > 0 && (
                    <span className="block mt-1">
                      Pages: {pages.map(p => p.title).join(', ')}
                    </span>
                  )}
                </p>
              </div>
              
              {pages.length > 0 ? (
                <PageList
                  pages={pages}
                  onEdit={handleEditPage}
                  onDelete={deletePage}
                />
              ) : (
                <EmptyPageState onAddPage={handleAddPage} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageManagement;
