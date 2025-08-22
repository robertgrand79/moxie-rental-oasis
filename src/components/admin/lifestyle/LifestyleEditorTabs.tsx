
import React from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Plus, Edit, Eye, Sparkles } from 'lucide-react';

interface LifestyleEditorTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddNew: () => void;
}

const LifestyleEditorTabs = ({
  activeTab,
  setActiveTab,
  onAddNew
}: LifestyleEditorTabsProps) => {
  return (
    <div className="flex items-center space-x-2 flex-wrap gap-2">
      <EnhancedButton
        variant={activeTab === 'list' ? 'gradient' : 'outline'}
        size="sm"
        onClick={() => setActiveTab('list')}
        className="min-h-[44px] sm:min-h-auto"
      >
        <Eye className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Gallery</span>
      </EnhancedButton>
      <EnhancedButton
        variant={activeTab === 'editor' ? 'gradient' : 'outline'}
        size="sm"
        onClick={onAddNew}
        className="min-h-[44px] sm:min-h-auto"
      >
        <Edit className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Editor</span>
      </EnhancedButton>
      <EnhancedButton
        variant={activeTab === 'ai' ? 'gradient' : 'outline'}
        size="sm"
        onClick={() => setActiveTab('ai')}
        className="min-h-[44px] sm:min-h-auto"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">AI Generator</span>
      </EnhancedButton>
    </div>
  );
};

export default LifestyleEditorTabs;
