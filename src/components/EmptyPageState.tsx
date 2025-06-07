
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface EmptyPageStateProps {
  onAddPage: () => void;
}

const EmptyPageState = ({ onAddPage }: EmptyPageStateProps) => {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-full flex items-center justify-center mx-auto mb-6">
        <FileText className="h-12 w-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">No Pages Yet</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Create your first page to start building your website content. You can add landing pages, about pages, or any custom content you need.
      </p>
      <Button 
        onClick={onAddPage}
        className="bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-from/90 hover:to-gradient-accent-from/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Page
      </Button>
    </div>
  );
};

export default EmptyPageState;
