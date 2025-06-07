
import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { EnhancedButton } from './ui/enhanced-button';

interface EmptyPageStateProps {
  onAddPage: () => void;
}

const EmptyPageState = ({ onAddPage }: EmptyPageStateProps) => {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="w-24 h-24 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <FileText className="h-12 w-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">No Pages Yet</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
        Create your first page to start building your website content. You can add landing pages, about pages, or any custom content you need.
      </p>
      <EnhancedButton 
        onClick={onAddPage}
        variant="gradient"
        size="lg"
        icon={<Plus className="h-4 w-4" />}
      >
        Create Your First Page
      </EnhancedButton>
    </div>
  );
};

export default EmptyPageState;
