
import React from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="flex items-center space-x-2">
      <Button
        variant={activeTab === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActiveTab('list')}
      >
        <Eye className="h-4 w-4 mr-2" />
        Gallery
      </Button>
      <Button
        variant={activeTab === 'editor' ? 'default' : 'outline'}
        size="sm"
        onClick={onAddNew}
      >
        <Edit className="h-4 w-4 mr-2" />
        Editor
      </Button>
      <Button
        variant={activeTab === 'ai' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActiveTab('ai')}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        AI Generator
      </Button>
    </div>
  );
};

export default LifestyleEditorTabs;
