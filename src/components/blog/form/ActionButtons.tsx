
import React from 'react';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
  author: string;
  published_at: Date | null;
  image_credit: string;
}

interface ActionButtonsProps {
  form: UseFormReturn<BlogFormData>;
  onSubmit: (data: BlogFormData) => void;
  isEditing: boolean;
  onCancel: () => void;
}

const ActionButtons = ({ form, onSubmit, isEditing, onCancel }: ActionButtonsProps) => {
  const { handleSubmit, setValue } = form;

  const handleSaveDraft = () => {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    setValue('status', 'published');
    handleSubmit(onSubmit)();
  };

  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
      >
        Cancel
      </Button>
      
      <div className="space-x-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={handleSaveDraft}
        >
          Save as Draft
        </Button>
        <Button 
          type="button"
          onClick={handlePublish}
        >
          {isEditing ? 'Update Post' : 'Publish Post'}
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
